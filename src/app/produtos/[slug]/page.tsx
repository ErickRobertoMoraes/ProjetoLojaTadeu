import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ slug: string }> };

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: product, error } = await supabase.from("products")
    .select("id, category_id, name, slug, brand, description, training_goal, variants:product_variants(id, sku, attributes, price_cents, stock, active), images:product_images(id, storage_path, alt_text, sort_order)")
    .eq("slug", slug).eq("active", true).maybeSingle();
  if (error || !product) notFound();
  const { data: category, error: categoryError } = await supabase.from("categories")
    .select("name").eq("id", product.category_id).eq("active", true).maybeSingle();
  if (categoryError || !category) notFound();

  const variants = (product.variants ?? []).filter((variant) => variant.active)
    .sort((a, b) => a.price_cents - b.price_cents);
  const images = (product.images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order).map((image) => ({
    ...image,
    url: supabase.storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl,
  }));

  return (
    <main className="product-detail-page">
      <header className="catalog-header">
        <Link href="/" className="brand-link">FitStore</Link>
        <nav className="catalog-account" aria-label="Conta"><Link href="/perfil">Minha conta</Link><Link href="/entrar">Entrar</Link></nav>
      </header>
      <nav aria-label="Trilha de navegação" className="breadcrumbs"><Link href="/produtos">Produtos</Link><span aria-hidden="true"> / </span><span>{product.name}</span></nav>
      <article className="product-detail">
        <section className="product-detail-gallery" aria-label="Imagens do produto">
          {images.length ? images.map((image) => (
            <img key={image.id} src={image.url} alt={image.alt_text} width={720} height={720} loading="lazy" />
          )) : <p className="catalog-notice">Este produto ainda não tem imagens.</p>}
        </section>
        <section className="product-detail-info">
          <p className="eyebrow">{category.name}</p>
          <h1>{product.name}</h1>
          {product.brand && <p className="product-brand">{product.brand}</p>}
          {product.description && <p>{product.description}</p>}
          {product.training_goal && <p className="product-goal">Objetivo: {product.training_goal}</p>}
          <h2>Variações</h2>
          {variants.length === 0 ? <p className="catalog-notice">As opções deste produto estarão disponíveis em breve.</p> : (
            <ul className="product-variant-list">
              {variants.map((variant) => {
                const attributes = Object.entries(variant.attributes as Record<string, unknown>)
                  .filter((entry): entry is [string, string] => typeof entry[1] === "string");
                const available = variant.stock > 0;
                return (
                  <li key={variant.id} className={available ? "product-variant" : "product-variant unavailable"}>
                    <div><strong>{attributes.map(([key, value]) => `${key}: ${value}`).join(" · ") || variant.sku}</strong>
                      <span>{available ? `Em estoque: ${variant.stock}` : "Indisponível no momento"}</span></div>
                    <span className="product-price">{formatPrice(variant.price_cents)}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <Link className="product-detail-back" href="/produtos">Voltar ao catálogo</Link>
        </section>
      </article>
    </main>
  );
}
