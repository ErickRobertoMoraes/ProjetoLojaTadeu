import { NextResponse } from "next/server";
import { quoteCoupon } from "@/lib/coupons/coupons";
import { requireConfirmedEmailForCheckout } from "@/lib/identity/authorization";
import { calculateShippingQuote } from "@/lib/shipping/shipping";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const authorization = await requireConfirmedEmailForCheckout(supabase.auth);
    if (!authorization.allowed) {
      return NextResponse.json({ error: authorization.reason }, { status: authorization.reason === "unauthenticated" ? 401 : 403 });
    }

    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "validation_failed" }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "validation_failed" }, { status: 400 });
    }
    const couponCode = (body as Record<string, unknown>).coupon_code;
    if (couponCode !== undefined && couponCode !== null &&
        (typeof couponCode !== "string" || couponCode.trim().length > 40)) {
      return NextResponse.json({ error: "validation_failed" }, { status: 400 });
    }

    const customerId = authorization.user.id;
    const { data: address, error: addressError } = await supabase.from("addresses")
      .select("postal_code, city, state, shipping_region").eq("customer_id", customerId).maybeSingle();
    if (addressError) return NextResponse.json({ error: "checkout_unavailable" }, { status: 503 });
    if (!address) return NextResponse.json({ error: "address_required" }, { status: 422 });

    const { data: cartItems, error: cartError } = await supabase.from("cart_items")
      .select("quantity, variant:product_variants!inner(id, sku, attributes, price_cents, stock, active, product:products!inner(name, active, category:categories!inner(active)))")
      .eq("customer_id", customerId).order("created_at", { ascending: true });
    if (cartError) return NextResponse.json({ error: "checkout_unavailable" }, { status: 503 });
    if (!cartItems?.length) return NextResponse.json({ error: "cart_empty" }, { status: 422 });

    const lines: { sku: string; name: string; attributes: Record<string, unknown>; quantity: number; unit_price_cents: number; line_total_cents: number }[] = [];
    let subtotalCents = 0;
    for (const item of cartItems) {
      const variant = Array.isArray(item.variant) ? item.variant[0] : item.variant;
      const product = variant && (Array.isArray(variant.product) ? variant.product[0] : variant.product);
      const category = product && (Array.isArray(product.category) ? product.category[0] : product.category);
      if (!variant || !product || !category || !variant.active || !product.active || !category.active ||
          !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > variant.stock ||
          !Number.isSafeInteger(variant.price_cents) || variant.price_cents < 0) {
        return NextResponse.json({ error: "cart_item_unavailable" }, { status: 409 });
      }
      const lineTotal = variant.price_cents * item.quantity;
      if (!Number.isSafeInteger(lineTotal) || !Number.isSafeInteger(subtotalCents + lineTotal)) {
        return NextResponse.json({ error: "cart_total_invalid" }, { status: 409 });
      }
      subtotalCents += lineTotal;
      lines.push({ sku: variant.sku, name: product.name, attributes: variant.attributes, quantity: item.quantity,
        unit_price_cents: variant.price_cents, line_total_cents: lineTotal });
    }

    let discountCents = 0;
    let coupon: { code: string; discount_percent: number } | null = null;
    if (typeof couponCode === "string" && couponCode.trim()) {
      const normalizedCode = couponCode.trim().toUpperCase();
      const { data: record, error: couponError } = await supabase.from("coupons")
        .select("code, discount_percent, starts_at, ends_at, minimum_order_cents, usage_limit, usage_count, active")
        .eq("code", normalizedCode).maybeSingle();
      if (couponError) return NextResponse.json({ error: "checkout_unavailable" }, { status: 503 });
      if (!record) return NextResponse.json({ error: "invalid_coupon" }, { status: 422 });
      const result = quoteCoupon(record, subtotalCents);
      if (!result.valid) return NextResponse.json({ error: result.reason }, { status: 422 });
      discountCents = result.discount_cents;
      coupon = { code: record.code, discount_percent: record.discount_percent };
    }

    const { data: rate, error: shippingError } = await supabase.from("shipping_regions")
      .select("code, name, price_cents, delivery_days, active").eq("code", address.shipping_region).eq("active", true).maybeSingle();
    if (shippingError) return NextResponse.json({ error: "checkout_unavailable" }, { status: 503 });
    const shipping = calculateShippingQuote(address.shipping_region, rate ? [rate] : []);
    if (!shipping) return NextResponse.json({ error: "shipping_region_unconfigured" }, { status: 422 });

    const totalCents = subtotalCents - discountCents + shipping.price_cents;
    if (!Number.isSafeInteger(totalCents)) return NextResponse.json({ error: "cart_total_invalid" }, { status: 409 });
    return NextResponse.json({ quote: {
      items: lines,
      address: { postal_code: address.postal_code, city: address.city, state: address.state },
      subtotal_cents: subtotalCents,
      coupon,
      discount_cents: discountCents,
      shipping,
      total_cents: totalCents,
    } });
  } catch {
    return NextResponse.json({ error: "checkout_unavailable" }, { status: 503 });
  }
}
