import Link from "next/link";
import { redirect } from "next/navigation";
import { CatalogAdminPanel } from "@/components/catalog/admin-panel";
import { getCatalogAdminClient } from "@/lib/catalog/admin";
import type { CatalogCategory, CatalogProduct } from "@/lib/catalog/catalog";

export default async function AdminCatalogPage() {
  const authorization = await getCatalogAdminClient();
  if (authorization.response?.status === 401) redirect("/entrar");
  if (authorization.response?.status === 403) redirect("/");
  if (authorization.response) {
    return <main className="admin-page"><h1>Catálogo indisponível</h1><p>Tente novamente em instantes.</p><Link href="/">Voltar</Link></main>;
  }

  const [categoryResult, productResult] = await Promise.all([
    authorization.client.from("categories").select("id, name, slug, active").order("name"),
    authorization.client.from("products")
      .select("id, category_id, name, slug, brand, description, training_goal, active, featured, category:categories(id, name, slug), variants:product_variants(id, product_id, sku, attributes, price_cents, stock, active), images:product_images(id, storage_path, alt_text, sort_order)")
      .order("updated_at", { ascending: false }).limit(100),
  ]);
  if (categoryResult.error || productResult.error) {
    return <main className="admin-page"><h1>Catálogo indisponível</h1><p>Tente novamente em instantes.</p><Link href="/">Voltar</Link></main>;
  }

  const products = (productResult.data ?? []).map((product) => ({
    ...product,
    variants: product.variants ?? [],
    images: (product.images ?? []).map((image) => ({
      ...image,
      url: authorization.client.storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl,
    })),
  }));

  return (
    <main className="admin-page">
      <Link href="/" className="brand-link">FitStore</Link>
      <p className="eyebrow">Painel administrativo</p>
      <h1>Gerenciar catálogo</h1>
      <p>Cadastre e organize categorias, produtos, variações, imagens e estoque.</p>
      <p><Link href="/admin/frete-cupons" className="brand-link">Configurar frete e cupons</Link></p>
      <CatalogAdminPanel
        categories={(categoryResult.data ?? []) as CatalogCategory[]}
        products={products as unknown as CatalogProduct[]}
      />
    </main>
  );
}
