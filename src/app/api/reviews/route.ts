import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "validation_failed" }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  if (typeof input.order_id !== "string" || !/^[0-9a-f-]{36}$/i.test(input.order_id) ||
    typeof input.product_id !== "string" || !/^[0-9a-f-]{36}$/i.test(input.product_id) ||
    typeof input.rating !== "number" || !Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5 ||
    (input.comment !== undefined && input.comment !== null &&
      (typeof input.comment !== "string" || input.comment.trim().length > 2000))) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const { data, error } = await supabase.from("reviews").insert({
      customer_id: authData.user.id,
      order_id: input.order_id,
      product_id: input.product_id,
      rating: input.rating,
      comment: typeof input.comment === "string" ? input.comment.trim() || null : null,
    }).select("id, product_id, rating, comment, created_at").single();
    if (error?.code === "23505") return NextResponse.json({ error: "review_already_exists" }, { status: 409 });
    if (error?.code === "42501") return NextResponse.json({ error: "review_not_eligible" }, { status: 403 });
    if (error || !data) return NextResponse.json({ error: "review_unavailable" }, { status: 503 });
    return NextResponse.json({ review: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "review_unavailable" }, { status: 503 });
  }
}
