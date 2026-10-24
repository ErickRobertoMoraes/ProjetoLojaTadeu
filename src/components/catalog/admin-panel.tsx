"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CatalogCategory, CatalogProduct } from "@/lib/catalog/catalog";
import { VariantManager } from "@/components/catalog/variant-manager";
import { ImageManager } from "@/components/catalog/image-manager";

type Props = { categories: CatalogCategory[]; products: CatalogProduct[] };

export function CatalogAdminPanel({ categories, products }: Props) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(url: string, method: string, body: unknown) {
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setNotice(errorMessage(result.error));
        return false;
      }
      setNotice("Alterações salvas.");
      router.refresh();
      return true;
    } catch {
      setNotice("Não foi possível conectar ao catálogo. Tente novamente.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function removeCategory(id: string) {
    if (!window.confirm("Excluir esta categoria? A categoria não pode ter produtos vinculados.")) return;
    await submit(`/api/admin/catalog/categories/${id}`, "DELETE", null);
  }

  async function archiveProduct(id: string) {
    if (!window.confirm("Desativar este produto? Os dados relacionados serão preservados.")) return;
    await submit(`/api/admin/catalog/products/${id}`, "DELETE", null);
  }

  return (
    <div className="admin-catalog-content">
      {notice && <p className="form-success" role="status">{notice}</p>}
      <section className="admin-section" aria-labelledby="categories-title">
        <div className="section-heading"><div><p className="eyebrow">Organização</p><h2 id="categories-title">Categorias</h2></div></div>
        <form className="catalog-admin-form category-create-form" onSubmit={async (event) => {
          event.preventDefault();
          const formElement = event.currentTarget;
          const form = new FormData(formElement);
          const saved = await submit("/api/admin/catalog/categories", "POST", {
            name: form.get("name"), slug: form.get("slug"), active: form.get("active") === "on",
          });
          if (saved) formElement.reset();
        }}>
          <label>Nome<input name="name" required maxLength={100} /></label>
          <label>Slug (URL)<input name="slug" required maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="ex.: roupas" /></label>
          <label className="checkbox-field"><input type="checkbox" name="active" defaultChecked /> Visível</label>
          <button type="submit" disabled={busy}>Adicionar categoria</button>
        </form>
        <div className="admin-list">
          {categories.map((category) => (
            <form className="admin-list-row" key={category.id} onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              await submit(`/api/admin/catalog/categories/${category.id}`, "PATCH", {
                name: form.get("name"), slug: form.get("slug"), active: form.get("active") === "on",
              });
            }}>
              <label>Nome<input name="name" defaultValue={category.name} required maxLength={100} /></label>
              <label>Slug<input name="slug" defaultValue={category.slug} required maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>
              <label className="checkbox-field"><input type="checkbox" name="active" defaultChecked={category.active} /> Visível</label>
              <div className="row-actions"><button type="submit" disabled={busy}>Salvar</button><button className="text-button" type="button" disabled={busy} onClick={() => void removeCategory(category.id)}>Excluir</button></div>
            </form>
          ))}
        </div>
      </section>

      <section className="admin-section" aria-labelledby="products-title">
        <div className="section-heading"><div><p className="eyebrow">Produtos</p><h2 id="products-title">Catálogo</h2></div><p>Variações, preços e estoque são cadastrados na próxima etapa.</p></div>
        <ProductForm categories={categories.filter((category) => category.active)} onSubmit={submit} busy={busy} />
        <div className="admin-product-list">
          {products.map((product) => (
            <article className="admin-product-row" key={product.id}>
              <div><span className={product.active ? "status-pill" : "status-pill inactive"}>{product.active ? "Publicado" : "Arquivado"}</span>
                <h3>{product.name}</h3><p>{product.category?.name ?? "Categoria indisponível"} · {product.brand ?? "Sem marca"}</p></div>
              <details><summary>Editar</summary>
                <ProductForm product={product} categories={categories} onSubmit={submit} busy={busy} />
              </details>
              <details><summary>Variações e estoque</summary><VariantManager productId={product.id} variants={product.variants ?? []} /></details>
              <details><summary>Imagens</summary><ImageManager productId={product.id} images={(product.images ?? []).map((image) => ({
                ...image,
                url: "url" in image && typeof image.url === "string" ? image.url : "",
              }))} /></details>
              {product.active && <button className="text-button" type="button" disabled={busy} onClick={() => void archiveProduct(product.id)}>Desativar</button>}
            </article>
          ))}
          {products.length === 0 && <p className="catalog-notice">Nenhum produto cadastrado.</p>}
        </div>
      </section>
    </div>
  );
}

function ProductForm({
  product, categories, onSubmit, busy,
}: {
  product?: CatalogProduct;
  categories: CatalogCategory[];
  onSubmit: (url: string, method: string, body: unknown) => Promise<boolean>;
  busy: boolean;
}) {
  return (
    <form className="catalog-admin-form product-edit-form" key={product?.id ?? "new"} onSubmit={async (event) => {
      event.preventDefault();
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      const body = {
        category_id: form.get("category_id"), name: form.get("name"), slug: form.get("slug"),
        brand: form.get("brand"), description: form.get("description"), training_goal: form.get("training_goal"),
        active: form.get("active") === "on", featured: form.get("featured") === "on",
      };
      const saved = await onSubmit(product ? `/api/admin/catalog/products/${product.id}` : "/api/admin/catalog/products", product ? "PATCH" : "POST", body);
      if (saved && !product) formElement.reset();
    }}>
      <label>Nome<input name="name" defaultValue={product?.name} required maxLength={180} /></label>
      <label>Slug (URL)<input name="slug" defaultValue={product?.slug} required maxLength={180} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="ex.: camiseta-fit" /></label>
      <label>Categoria<select name="category_id" defaultValue={product?.category_id ?? categories[0]?.id ?? ""} required>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select></label>
      <label>Marca<input name="brand" defaultValue={product?.brand ?? ""} maxLength={120} /></label>
      <label>Objetivo de treino<input name="training_goal" defaultValue={product?.training_goal ?? ""} maxLength={120} /></label>
      <label className="wide-field">Descrição<textarea name="description" defaultValue={product?.description ?? ""} maxLength={10000} rows={4} /></label>
      <label className="checkbox-field"><input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Publicado</label>
      <label className="checkbox-field"><input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> Destaque</label>
      <button type="submit" disabled={busy || categories.length === 0}>{product ? "Salvar produto" : "Cadastrar produto"}</button>
    </form>
  );
}

function errorMessage(code?: string): string {
  if (code === "unauthenticated") return "Entre novamente para continuar.";
  if (code === "forbidden") return "Apenas administradores ativos podem gerenciar o catálogo.";
  if (code === "validation_failed") return "Revise os campos informados.";
  if (code === "catalog_conflict") return "Já existe um item com esse nome ou slug.";
  if (code === "category_in_use" || code === "catalog_reference_conflict") return "A categoria está vinculada a produtos e não pode ser excluída.";
  return "Não foi possível salvar as alterações do catálogo.";
}
