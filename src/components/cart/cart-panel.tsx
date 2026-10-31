"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Item = {
  id: string; variant_id: string; quantity: number;
  variant: null | {
    sku: string; attributes: Record<string, unknown>; price_cents: number; stock: number; available: boolean;
    product: { name: string; slug: string };
  };
};

function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function CartPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "login">("loading");
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/cart", { cache: "no-store" });
      if (response.status === 401) { setStatus("login"); return; }
      if (!response.ok) { setStatus("error"); return; }
      const result = await response.json();
      setItems(result.items);
      setStatus("ready");
    } catch { setStatus("error"); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function change(item: Item, quantity: number | null) {
    setMessage("");
    try {
      const response = await fetch(`/api/cart/items/${item.variant_id}`, quantity === null
        ? { method: "DELETE" }
        : { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity }) });
      const result = await response.json();
      if (!response.ok) setMessage(result.error === "insufficient_stock"
        ? `Estoque atualizado. Disponível: ${result.available}.` : "Não foi possível atualizar este item.");
      await refresh();
    } catch { setMessage("Não foi possível conectar ao carrinho. Tente novamente."); }
  }

  const subtotal = items.reduce((sum, item) => sum + (item.variant?.price_cents ?? 0) * item.quantity, 0);

  if (status === "loading") return <p role="status">Carregando carrinho…</p>;
  if (status === "login") return <p>Entre na sua conta para consultar seu carrinho. <Link href="/entrar">Entrar</Link></p>;
  if (status === "error") return <p role="alert">O carrinho está temporariamente indisponível. <button type="button" onClick={() => void refresh()}>Tentar novamente</button></p>;

  return <section aria-label="Itens do carrinho">
    {message && <p role="status" className="catalog-notice">{message}</p>}
    {items.length === 0 ? <p>Seu carrinho está vazio. <Link href="/produtos">Ver produtos</Link></p> : <>
      <ul className="cart-item-list">
        {items.map((item) => {
          const variant = item.variant;
          const attrs = variant ? Object.entries(variant.attributes).filter((entry): entry is [string, string] => typeof entry[1] === "string") : [];
          return <li className="cart-item" key={item.id}>
            <div className="cart-item-info">
              {variant?.available ? <Link href={`/produtos/${variant.product.slug}`}><strong>{variant.product.name}</strong></Link>
                : <strong>Produto indisponível</strong>}
              {attrs.length > 0 && <span>{attrs.map(([key, value]) => `${key}: ${value}`).join(" · ")}</span>}
              {variant && <span>{money(variant.price_cents)} por unidade</span>}
              {!variant?.available && <span>Esta opção saiu de estoque ou não está mais disponível.</span>}
            </div>
            {variant?.available && <label>Quantidade
              <input type="number" min={1} max={Math.min(99, variant.stock)} defaultValue={item.quantity}
                onBlur={(event) => {
                  const quantity = Number(event.currentTarget.value);
                  if (Number.isInteger(quantity) && quantity >= 1 && quantity !== item.quantity) void change(item, quantity);
                  else if (quantity < 1 || quantity > 99) event.currentTarget.value = String(item.quantity);
                }} />
            </label>}
            <button type="button" className="cart-remove-button" onClick={() => void change(item, null)}>Remover</button>
          </li>;
        })}
      </ul>
      <p className="cart-subtotal"><strong>Subtotal dos itens: {money(subtotal)}</strong></p>
      <p>Frete e descontos são calculados na etapa seguinte.</p>
      <Link href="/checkout">Continuar para o checkout</Link>
      <Link href="/produtos">Continuar comprando</Link>
    </>}
  </section>;
}
