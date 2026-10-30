import { NextResponse } from "next/server";
import { canSetCartQuantity, isCartVariantAvailable, parseCartChange } from "@/lib/cart/cart";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getCustomer() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

export async function GET() {
  try {
    const { supabase, user } = await getCustomer();
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const { data, error } = await supabase.from("cart_items")
      .select("id, variant_id, quantity, variant:product_variants(id, sku, attributes, price_cents, stock, active, product:products!inner(id, name, slug, active, category:categories!inner(active)) )")
      .eq("customer_id", user.id).order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: "cart_unavailable" }, { status: 503 });
    const items = (data ?? []).map((item) => {
      const variant = Array.isArray(item.variant) ? item.variant[0] : item.variant;
      const product = variant && (Array.isArray(variant.product) ? variant.product[0] : variant.product);
      const category = product && (Array.isArray(product.category) ? product.category[0] : product.category);
      const available = Boolean(variant && product && isCartVariantAvailable({
        active: variant.active, stock: variant.stock, product: { active: product.active, category },
      }));
      return { ...item, variant: variant ? { ...variant, product, available } : null };
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "cart_unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getCustomer();
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "validation_failed" }, { status: 400 }); }
    const change = parseCartChange(body);
    if (!change) return NextResponse.json({ error: "validation_failed" }, { status: 400 });

    const { data: variant, error: variantError } = await supabase.from("product_variants")
      .select("id, stock, active, product:products!inner(active, category:categories!inner(active))")
      .eq("id", change.variant_id).maybeSingle();
    if (variantError) return NextResponse.json({ error: "cart_unavailable" }, { status: 503 });
    const product = variant && (Array.isArray(variant.product) ? variant.product[0] : variant.product);
    const category = product && (Array.isArray(product.category) ? product.category[0] : product.category);
    if (!variant || !isCartVariantAvailable({ active: variant.active, stock: variant.stock, product: product && { active: product.active, category } })) {
      return NextResponse.json({ error: "variant_unavailable" }, { status: 409 });
    }
    const { data: current, error: currentError } = await supabase.from("cart_items")
      .select("quantity").eq("customer_id", user.id).eq("variant_id", change.variant_id).maybeSingle();
    if (currentError) return NextResponse.json({ error: "cart_unavailable" }, { status: 503 });
    const quantity = (current?.quantity ?? 0) + change.quantity;
    if (!canSetCartQuantity(quantity, variant.stock)) return NextResponse.json({ error: "insufficient_stock", available: variant.stock }, { status: 409 });

    const { error: cartError } = await supabase.from("carts").upsert({ customer_id: user.id }, { onConflict: "customer_id", ignoreDuplicates: true });
    if (cartError) return NextResponse.json({ error: "cart_unavailable" }, { status: 503 });
    const { data, error } = await supabase.from("cart_items").upsert({
      customer_id: user.id, variant_id: change.variant_id, quantity,
    }, { onConflict: "customer_id,variant_id" }).select("id, variant_id, quantity").single();
    if (error) return NextResponse.json({ error: "cart_unavailable" }, { status: 503 });
    return NextResponse.json({ item: data }, { status: current ? 200 : 201 });
  } catch {
    return NextResponse.json({ error: "cart_unavailable" }, { status: 503 });
  }
}
