import Link from "next/link";
import { redirect } from "next/navigation";
import { ReviewForm } from "@/components/reviews/review-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ReviewsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/entrar");

  const [{ data: orders }, { data: reviews }] = await Promise.all([
    supabase.from("orders").select("id, order_items(variant_id, product_name_snapshot, product_variants(product_id))")
      .eq("customer_id", authData.user.id).eq("status", "delivered").order("created_at", { ascending: false }),
    supabase.from("reviews").select("product_id").eq("customer_id", authData.user.id),
  ]);
  const reviewed = new Set((reviews ?? []).map((review) => review.product_id));
  const eligible: { orderId: string; productId: string; productName: string }[] = [];
  for (const order of orders ?? []) {
    for (const item of order.order_items ?? []) {
      const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
      if (variant?.product_id && !reviewed.has(variant.product_id) &&
        !eligible.some((entry) => entry.productId === variant.product_id)) {
        eligible.push({ orderId: order.id, productId: variant.product_id, productName: item.product_name_snapshot });
      }
    }
  }

  return (
    <main className="reviews-page">
      <header className="catalog-header"><Link href="/" className="brand-link">FitStore</Link><Link href="/perfil">Minha conta</Link></header>
      <h1>Avalie suas compras</h1>
      <p>Você pode avaliar produtos de pedidos entregues. Cada produto aceita uma avaliação por cliente.</p>
      {eligible.length === 0 ? <p>Nenhum produto disponível para avaliação no momento.</p> : (
        <ul className="review-list">{eligible.map((entry) => (
          <li key={entry.productId}><h2>{entry.productName}</h2><ReviewForm {...entry} /></li>
        ))}</ul>
      )}
    </main>
  );
}
