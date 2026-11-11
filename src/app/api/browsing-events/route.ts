import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "validation_failed" }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const productId = typeof input.product_id === "string" && UUID.test(input.product_id) ? input.product_id : null;
  const categoryId = typeof input.category_id === "string" && UUID.test(input.category_id) ? input.category_id : null;
  const trainingGoal = typeof input.training_goal === "string" ? input.training_goal.trim() : null;
  if (Object.keys(input).some((key) => !["product_id", "category_id", "training_goal"].includes(key)) ||
    [productId, categoryId, trainingGoal].filter(Boolean).length !== 1 ||
    (input.product_id !== undefined && !productId) || (input.category_id !== undefined && !categoryId) ||
    (input.training_goal !== undefined && (typeof input.training_goal !== "string" || !trainingGoal || trainingGoal.length > 120))) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    let event: Record<string, unknown>;
    if (productId) {
      const { data, error } = await supabase.from("products").select("id").eq("id", productId).eq("active", true).maybeSingle();
      if (error) return NextResponse.json({ error: "event_unavailable" }, { status: 503 });
      if (!data) return NextResponse.json({ error: "product_not_found" }, { status: 404 });
      event = { event_type: "view", product_id: productId };
    } else if (categoryId) {
      const { data, error } = await supabase.from("categories").select("id").eq("id", categoryId).eq("active", true).maybeSingle();
      if (error) return NextResponse.json({ error: "event_unavailable" }, { status: 503 });
      if (!data) return NextResponse.json({ error: "category_not_found" }, { status: 404 });
      event = { event_type: "category", category_id: categoryId };
    } else {
      const { data, error } = await supabase.from("products").select("id").eq("training_goal", trainingGoal!).eq("active", true).limit(1);
      if (error) return NextResponse.json({ error: "event_unavailable" }, { status: 503 });
      if (!data?.length) return NextResponse.json({ error: "training_goal_not_found" }, { status: 404 });
      event = { event_type: "goal", training_goal: trainingGoal };
    }

    const { error } = await supabase.from("browsing_events").insert({ customer_id: authData.user.id, ...event });
    if (error) return NextResponse.json({ error: "event_unavailable" }, { status: 503 });
    return NextResponse.json({ recorded: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "event_unavailable" }, { status: 503 });
  }
}
