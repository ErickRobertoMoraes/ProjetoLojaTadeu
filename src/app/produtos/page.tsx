import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseCatalogFilters, CATALOG_PAGE_SIZE } from "@/lib/catalog/catalog";
import { listCatalogProducts } from "@/lib/catalog/queries";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") params.set(key, value);
  }
  const filters = parseCatalogFilters(params);
  const supabase = await createSupabaseServerClient();
  const [{ data: categories, error: categoriesError }, result] = await Promise.all([
    supabase.from("categories").select("id, name, slug").eq("active", true).order("name"),
    filters ? listCatalogProducts(supabase, filters) : Promise.resolve({ products: [], total: 0, error: true }),
  ]);
  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <Link href="/" className="brand-link">FitStore</Link>
        <nav className="catalog-account" aria-label="Conta">
          <Link href="/perfil">Minha conta</Link>
          <Link href="/entrar">Entrar</Link>
        </nav>
      </header>
      <section className="catalog-intro">
        <p className="eyebrow">FitStore · movimento para todos os dias</p>
        <h1>Encontre seu próximo treino</h1>
        <p>Explore roupas, suplementos e acessórios e filtre o catálogo do seu jeito.</p>
      </section>
      <nav className="category-links catalog-category-links" aria-label="Filtrar por categoria">
        <Link href="/produtos">Todos</Link>
        {(categories ?? []).map((category) => (
          <Link key={category.id} href={`/produtos?category=${encodeURIComponent(category.slug)}`}>
            {category.name}
          </Link>
        ))}
      </nav>
      <form className="catalog-filters" action="/produtos" method="get" aria-label="Filtros do catálogo">
        <label>Buscar<input name="q" defaultValue={params.get("q") ?? ""} maxLength={100} /></label>
        <label>Categoria<select name="category" defaultValue={filters?.category ?? ""}>
          <option value="">Todas</option>
          {(categories ?? []).map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select></label>
        <label>Marca<input name="brand" defaultValue={filters?.brand ?? ""} maxLength={120} /></label>
        <label>Objetivo<input name="objective" defaultValue={filters?.objective ?? ""} maxLength={120} /></label>
        <label>Preço mínimo<input name="min_price" inputMode="decimal" placeholder="0,00" defaultValue={params.get("min_price") ?? ""} /></label>
        <label>Preço máximo<input name="max_price" inputMode="decimal" placeholder="0,00" defaultValue={params.get("max_price") ?? ""} /></label>
        <button type="submit">Aplicar filtros</button>
      </form>
      <section aria-live="polite" aria-label="Resultados do catálogo">
        {categoriesError ? (
          <p className="catalog-notice" role="status">O catálogo está temporariamente indisponível. Tente novamente em instantes.</p>
        ) : !filters ? (
          <p className="catalog-notice" role="alert">Confira a busca, os filtros e a faixa de preço informados.</p>
        ) : result.error ? (
          <p className="catalog-notice" role="status">O catálogo está temporariamente indisponível. Tente novamente em instantes.</p>
        ) : result.products.length === 0 ? (
          <p className="catalog-notice">Nenhum produto encontrado com esses filtros.</p>
        ) : (
          <>
            <p className="catalog-count">{result.total} {result.total === 1 ? "produto encontrado" : "produtos encontrados"}</p>
            <div className="product-grid">
              {result.products.map((product) => {
                const prices = product.variants.filter((variant) => Number.isInteger(variant.price_cents) && variant.price_cents >= 0)
                  .map((variant) => variant.price_cents);
                const lowestPrice = prices.length ? Math.min(...prices) : null;
                const mainImage = [...(product.images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
                const imageUrl = mainImage
                  ? supabase.storage.from("product-images").getPublicUrl(mainImage.storage_path).data.publicUrl
                  : null;
                return (
                  <article className="product-card" key={product.id}>
                    {mainImage && imageUrl && <Link href={`/produtos/${product.slug}`} className="product-card-image-link"><img src={imageUrl} alt={mainImage.alt_text} /></Link>}
                    <span className="product-category">{product.category?.name ?? "FitStore"}</span>
                    <h2><Link href={`/produtos/${product.slug}`}>{product.name}</Link></h2>
                    {product.brand && <p className="product-brand">{product.brand}</p>}
                    {product.description && <p>{product.description}</p>}
                    {product.training_goal && <p className="product-goal">{product.training_goal}</p>}
                    <p className="product-price">{lowestPrice === null ? "Preço em breve" : `A partir de ${formatPrice(lowestPrice)}`}</p>
                    <Link className="product-detail-link" href={`/produtos/${product.slug}`}>Ver produto</Link>
                  </article>
                );
              })}
            </div>
            <nav className="pagination" aria-label="Paginação">
              {filters.page > 1 && <Link href={`/produtos?${new URLSearchParams({ ...Object.fromEntries(params), page: String(filters.page - 1) })}`}>Página anterior</Link>}
              <span>Página {filters.page} de {Math.max(1, Math.ceil(result.total / CATALOG_PAGE_SIZE))}</span>
              {filters.page < Math.ceil(result.total / CATALOG_PAGE_SIZE) && <Link href={`/produtos?${new URLSearchParams({ ...Object.fromEntries(params), page: String(filters.page + 1) })}`}>Próxima página</Link>}
            </nav>
          </>
        )}
      </section>
    </main>
  );
}
