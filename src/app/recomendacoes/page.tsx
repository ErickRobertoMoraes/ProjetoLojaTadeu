import Link from "next/link";
import { getCustomerRecommendations } from "@/lib/recommendations/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function RecommendationsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return <main className="recommendations-page"><h1>Minhas recomendações</h1>
      <p>Entre na sua conta para ver sugestões baseadas na sua navegação e nas suas compras.</p>
      <Link href="/entrar">Entrar</Link></main>;
  }

  const { recommendations, error } = await getCustomerRecommendations(supabase, authData.user.id);
  return (
    <main className="recommendations-page">
      <header className="catalog-header"><Link href="/" className="brand-link">FitStore</Link>
        <nav className="catalog-account" aria-label="Conta"><Link href="/produtos">Catálogo</Link><Link href="/perfil">Minha conta</Link></nav>
      </header>
      <section className="catalog-intro"><p className="eyebrow">FitStore · sugestões para você</p>
        <h1>Minhas recomendações</h1>
        <p>Sugestões explicadas a partir dos produtos que você viu, comprou ou explorou.</p></section>
      {error ? <p className="catalog-notice" role="status">Não foi possível carregar as sugestões agora. Tente novamente em instantes.</p>
        : recommendations.length === 0 ? <p className="catalog-notice">Ainda não há produtos disponíveis para recomendar. Explore o catálogo para começar.</p>
          : <div className="product-grid" aria-label="Produtos recomendados">
            {recommendations.map(({ product, reason }) => {
              const image = [...(product.images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
              const imageUrl = image ? supabase.storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl : null;
              return <article className="product-card" key={product.id}>
                {image && imageUrl && <Link href={`/produtos/${product.slug}`} className="product-card-image-link"><img src={imageUrl} alt={image.alt_text} /></Link>}
                <h2><Link href={`/produtos/${product.slug}`}>{product.name}</Link></h2>
                <p className="recommendation-reason">{reason}</p>
                <Link className="product-detail-link" href={`/produtos/${product.slug}`}>Ver produto</Link>
              </article>;
            })}
          </div>}
    </main>
  );
}
