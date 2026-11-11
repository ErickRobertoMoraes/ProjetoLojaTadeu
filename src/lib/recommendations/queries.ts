import type { SupabaseClient } from "@supabase/supabase-js";
import {
  rankRecommendations,
  type RecommendationCandidate,
  type RecommendationSignal,
} from "./recommendations";

export async function getCustomerRecommendations(client: SupabaseClient, customerId: string) {
  const [eventsResult, ordersResult, productsResult] = await Promise.all([
    client.from("browsing_events")
      .select("event_type, product_id, category_id, training_goal, product:products(name, category_id, training_goal)")
      .eq("customer_id", customerId).order("occurred_at", { ascending: false }).limit(100),
    client.from("orders")
      .select("order_items(product_name_snapshot, variant:product_variants(product_id, product:products(name, category_id, training_goal)))")
      .eq("customer_id", customerId).neq("status", "cancelled").order("created_at", { ascending: false }).limit(50),
    client.from("products")
      .select("id, name, slug, category_id, training_goal, featured, category:categories!inner(active), variants:product_variants(active, stock), images:product_images(storage_path, alt_text, sort_order)")
      .eq("active", true).eq("category.active", true).eq("variants.active", true)
      .order("name", { ascending: true }),
  ]);

  if (eventsResult.error || ordersResult.error || productsResult.error) {
    return { recommendations: [], error: true };
  }

  const signals: RecommendationSignal[] = [];
  for (const event of eventsResult.data ?? []) {
    const product = event.product as unknown as { name: string; category_id: string; training_goal: string | null } | null;
    if (event.event_type === "view" && event.product_id) {
      signals.push({ kind: "view", productId: event.product_id, productName: product?.name,
        categoryId: product?.category_id ?? null, trainingGoal: product?.training_goal ?? null });
    }
    if (event.category_id) signals.push({ kind: "category", categoryId: event.category_id });
    if (event.event_type === "goal" && event.training_goal) signals.push({ kind: "goal", trainingGoal: event.training_goal });
  }

  for (const order of ordersResult.data ?? []) {
    for (const item of (order.order_items ?? []) as unknown as {
      product_name_snapshot: string;
      variant: { product_id: string; product: { category_id: string; training_goal: string | null } | null } | null;
    }[]) {
      if (!item.variant?.product_id) continue;
      signals.push({ kind: "purchase", productId: item.variant.product_id,
        productName: item.product_name_snapshot, categoryId: item.variant.product?.category_id ?? null,
        trainingGoal: item.variant.product?.training_goal ?? null });
    }
  }

  const candidates = (productsResult.data ?? []).map((row) => {
    const product = row as unknown as { category_id: string; training_goal: string | null } & Record<string, unknown>;
    return { ...product, categoryId: product.category_id, trainingGoal: product.training_goal } as unknown as RecommendationCandidate;
  });
  return { recommendations: rankRecommendations(candidates, signals), error: false };
}
