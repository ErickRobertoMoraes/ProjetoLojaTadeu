"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CatalogVariant } from "@/lib/catalog/catalog";

export function VariantManager({ productId, variants }: { productId: string; variants: CatalogVariant[] }) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>, variant?: CatalogVariant) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    let attributes: unknown;
    try { attributes = JSON.parse(String(form.get("attributes") ?? "{}")); } catch {
      setNotice("Informe os atributos como JSON válido, por exemplo: {\"Tamanho\":\"M\"}.");
      return;
    }
    const price = String(form.get("price") ?? "").trim().replace(",", ".");
    if (!/^\d+(?:\.\d{1,2})?$/.test(price)) {
      setNotice("Informe um preço em reais com até duas casas decimais.");
      return;
    }
    const priceCents = Math.round(Number(price) * 100);
    const stock = Number(form.get("stock"));
    if (!Number.isSafeInteger(stock) || stock < 0) {
      setNotice("O estoque deve ser um número inteiro igual ou maior que zero.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(variant
        ? `/api/admin/catalog/products/${productId}/variants/${variant.id}`
        : `/api/admin/catalog/products/${productId}/variants`, {
        method: variant ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: form.get("sku"), attributes, price_cents: priceCents, stock, active: form.get("active") === "on" }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setNotice(result.error === "catalog_conflict" ? "Este SKU já está cadastrado." : "Revise os dados da variação e tente novamente.");
        return;
      }
      setNotice("Variação salva.");
      if (!variant) formElement.reset();
      router.refresh();
    } catch {
      setNotice("Não foi possível salvar a variação. Tente novamente.");
    } finally { setBusy(false); }
  }

  async function remove(variant: CatalogVariant) {
    if (!variant.id || !window.confirm(`Excluir a variação ${variant.sku}?`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/catalog/products/${productId}/variants/${variant.id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      setNotice(response.ok ? "Variação excluída." : result.error === "catalog_reference_conflict"
        ? "A variação já está vinculada a outro registro e não pode ser excluída. Desative-a para ocultá-la."
        : "Não foi possível excluir a variação.");
      if (response.ok) router.refresh();
    } catch { setNotice("Não foi possível excluir a variação."); }
    finally { setBusy(false); }
  }

  return (
    <section className="catalog-submanager" aria-label={`Variações de ${productId}`}>
      <h4>Variações e estoque</h4>
      {notice && <p role="status" className="form-success">{notice}</p>}
      {variants.map((variant) => (
        <form className="catalog-admin-form variant-form" key={variant.id} onSubmit={(event) => void save(event, variant)}>
          <label>SKU<input name="sku" defaultValue={variant.sku} required maxLength={80} /></label>
          <label>Atributos (JSON)<input name="attributes" defaultValue={JSON.stringify(variant.attributes)} required /></label>
          <label>Preço (R$)<input name="price" defaultValue={(variant.price_cents / 100).toFixed(2)} inputMode="decimal" required /></label>
          <label>Estoque<input name="stock" defaultValue={variant.stock} type="number" min="0" step="1" required /></label>
          <label className="checkbox-field"><input name="active" type="checkbox" defaultChecked={variant.active} /> Ativa</label>
          <div className="row-actions"><button type="submit" disabled={busy}>Salvar variação</button><button className="text-button" type="button" disabled={busy} onClick={() => void remove(variant)}>Excluir</button></div>
        </form>
      ))}
      <form className="catalog-admin-form variant-form" onSubmit={(event) => void save(event)}>
        <label>Novo SKU<input name="sku" required maxLength={80} /></label>
        <label>Atributos (JSON)<input name="attributes" defaultValue="{}" required /></label>
        <label>Preço (R$)<input name="price" inputMode="decimal" placeholder="0,00" required /></label>
        <label>Estoque<input name="stock" type="number" min="0" step="1" defaultValue="0" required /></label>
        <label className="checkbox-field"><input name="active" type="checkbox" defaultChecked /> Ativa</label>
        <button type="submit" disabled={busy}>Adicionar variação</button>
      </form>
      {variants.some((variant) => variant.active && variant.stock === 0) && <p className="catalog-notice">Variações ativas sem estoque permanecem visíveis como indisponíveis.</p>}
    </section>
  );
}
