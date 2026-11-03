"use client";

import { useEffect, useState } from "react";

type Quote = {
  items: { sku: string; name: string; attributes: Record<string, unknown>; quantity: number; unit_price_cents: number; line_total_cents: number }[];
  address: { postal_code: string; city: string; state: string };
  subtotal_cents: number;
  coupon: { code: string; discount_percent: number } | null;
  discount_cents: number;
  shipping: { name: string; price_cents: number; delivery_days: number };
  total_cents: number;
};

function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

const errors: Record<string, string> = {
  unauthenticated: "Entre na sua conta para continuar.",
  email_unconfirmed: "Confirme seu e-mail antes de avançar para o checkout.",
  address_required: "Cadastre seu endereço em Minha conta antes de cotar o pedido.",
  cart_empty: "Adicione produtos ao carrinho antes de continuar.",
  cart_item_unavailable: "Um item do carrinho não está mais disponível ou excede o estoque atual.",
  invalid_coupon: "Cupom não encontrado ou inválido.",
  not_started: "Esse cupom ainda não está válido.",
  expired: "Esse cupom expirou.",
  minimum_not_met: "O subtotal não atingiu o mínimo desse cupom.",
  usage_exhausted: "Esse cupom atingiu o limite de usos.",
  shipping_region_unconfigured: "O frete da sua região ainda não está configurado.",
};

export function CheckoutQuote() {
  const [couponCode, setCouponCode] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "boleto">("pix");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<{ order_id: string; total_cents: number } | null>(null);

  async function refresh() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/checkout/quote", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupon_code: couponCode }), cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) {
        setQuote(null);
        setMessage(errors[result.error] ?? "Não foi possível calcular o pedido agora.");
      } else {
        setQuote(result.quote);
      }
    } catch {
      setQuote(null);
      setMessage("Não foi possível conectar para calcular o pedido.");
    } finally {
      setLoading(false);
    }
  }

  async function approvePayment() {
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_method: paymentMethod, coupon_code: couponCode }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(errors[result.error] ?? "Não foi possível confirmar a compra agora.");
      } else {
        setOrder(result.order);
      }
    } catch {
      setMessage("Não foi possível conectar para confirmar a compra.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  return <section aria-label="Cotação do checkout">
    <form onSubmit={(event) => { event.preventDefault(); void refresh(); }}>
      <label htmlFor="checkout-coupon">Cupom (opcional)</label>
      <input id="checkout-coupon" value={couponCode} maxLength={40} onChange={(event) => setCouponCode(event.target.value)} />
      <button type="submit" disabled={loading}>{loading ? "Calculando…" : "Atualizar cotação"}</button>
    </form>
    {message && <p role="alert">{message}</p>}
    {order && <section aria-live="polite" aria-label="Pedido confirmado">
      <h2>Pagamento simulado aprovado</h2>
      <p>Pedido {order.order_id} confirmado no valor de {money(order.total_cents)}.</p>
      <p role="note">Nenhuma cobrança real foi realizada.</p>
    </section>}
    {quote && <div aria-live="polite">
      <h2>Resumo do pedido</h2>
      <p>Entrega para {quote.address.city} – {quote.address.state}, CEP {quote.address.postal_code}</p>
      <ul>{quote.items.map((item) => <li key={item.sku}>
        {item.name} · {item.quantity} × {money(item.unit_price_cents)} — {money(item.line_total_cents)}
      </li>)}</ul>
      <p>Subtotal: {money(quote.subtotal_cents)}</p>
      {quote.coupon && <p>Cupom {quote.coupon.code}: −{money(quote.discount_cents)}</p>}
      <p>Frete ({quote.shipping.name}, {quote.shipping.delivery_days} dias): {money(quote.shipping.price_cents)}</p>
      <p><strong>Total cotado: {money(quote.total_cents)}</strong></p>
      {!order && <>
        <fieldset>
          <legend>Forma de pagamento simulada</legend>
          <label><input type="radio" name="payment-method" value="pix" checked={paymentMethod === "pix"} onChange={() => setPaymentMethod("pix")} /> PIX</label>
          <label><input type="radio" name="payment-method" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} /> Cartão</label>
          <label><input type="radio" name="payment-method" value="boleto" checked={paymentMethod === "boleto"} onChange={() => setPaymentMethod("boleto")} /> Boleto</label>
        </fieldset>
        <p role="note">A aprovação é simulada. Nenhuma cobrança real será feita.</p>
        <button type="button" disabled={loading || submitting} onClick={() => void approvePayment()}>
          {submitting ? "Confirmando…" : "Aprovar pagamento simulado"}
        </button>
      </>}
    </div>}
  </section>;
}
