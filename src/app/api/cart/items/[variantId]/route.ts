import { NextResponse } from "next/server";
import { canSetCartQuantity, isCartVariantAvailable } from "@/lib/cart/cart";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ variantId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const { variantId } = await context.params;
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "validation_failed" }, { status: 400 }); }
    const quantity = typeof body === "object" && body !== null && !Array.isArray(body)
      ? (body as Record<string, unknown>).quantity : null;
    if (!Number.isSafeInteger(quantity) || (quantity as number) < 1 || (quantity as number) > 99) {
      return NextResponse.json({ error: "validation_failed" }, { status: 400 });
    }
    const { data: variant, error: variantError } = await supabase.from("product_variants")
      .select("id, stock, active, product:products!inner(active, category:categories!inner(active))")
      .eq("id", variantId).maybeSingle();
    if (variantError) return NextResponse.json({ error: "cart_unavailable" }, { status: 503 });
    const product = variant && (Array.isArray(variant.product) ? variant.product[0] : variant.product);
    const category = product && (Array.isArray(product.category) ? product.category[0] : product.category);
    if (!variant || !isCartVariantAvailable({ active: variant.active, stock: variant.stock, product: product && { active: product.active, category } })) {
      return NextResponse.json({ error: "variant_unavailable" }, { status: 409 });
    }
    if (!canSetCartQuantity(quantity as number, variant.stock)) return NextResponse.json({ error: "insufficient_stock", available: variant.stock }, { status: 409 });
    const { data, error } = await supabase.from("cart_items").update({ quantity: quantity as number })
      .eq("customer_id", auth.user.id).eq("variant_id", variantId).select("id, variant_id, quantity").maybeSingle();
    if (error) return NextResponse.json({ error: "cart_unavailable" }, { status: 503 });
    if (!data) return NextResponse.json({ error: "cart_item_not_found" }, { status: 404 });
    return NextResponse.json({ item: data });
  } catch {
    return NextResponse.json({ error: "cart_unavailable" }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const { variantId } = await context.params;
    const { data, error } = await supabase.from("cart_items").delete()
      .eq("customer_id", auth.user.id).eq("variant_id", variantId).select("id").maybeSingle();
    if (error) return NextResponse.json({ error: "cart_unavailable" }, { status: 503 });
    if (!data) return NextResponse.json({ error: "cart_item_not_found" }, { status: 404 });
    return NextResponse.json({ removed: true });
  } catch {
    return NextResponse.json({ error: "cart_unavailable" }, { status: 503 });
  }
}
