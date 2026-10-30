"use client";

import { useState } from "react";

export function AddToCartButton({ variantId, available }: { variantId: string; available: boolean }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function add() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/cart", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(response.status === 401 ? "Entre na sua conta para adicionar ao carrinho." :
          result.error === "insufficient_stock" ? `Limite disponível: ${result.available}.` :
            "Não foi possível adicionar esta opção ao carrinho.");
      } else setMessage("Adicionado ao carrinho.");
    } catch {
      setMessage("Não foi possível conectar ao carrinho. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return <div className="add-to-cart-control">
    <button type="button" className="secondary-button" disabled={!available || pending} onClick={add}>
      {!available ? "Indisponível" : pending ? "Adicionando…" : "Adicionar ao carrinho"}
    </button>
    {message && <span role="status">{message}</span>}
  </div>;
}
