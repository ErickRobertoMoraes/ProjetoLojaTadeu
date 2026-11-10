"use client";

import { useState } from "react";

type Props = { orderId: string; productId: string; productName: string };

export function ReviewForm({ orderId, productId, productName }: Props) {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit(formData: FormData) {
    setMessage("");
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: orderId,
        product_id: productId,
        rating: Number(formData.get("rating")),
        comment: String(formData.get("comment") ?? "").trim(),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error === "review_already_exists" ? "Você já avaliou este produto." :
        result.error === "review_not_eligible" ? "Este pedido não permite avaliar o produto." : "Não foi possível enviar a avaliação.");
      return;
    }
    setSubmitted(true);
    setMessage("Avaliação enviada.");
  }

  if (submitted) return <p role="status">{message}</p>;
  return (
    <form action={submit} className="review-form">
      <label htmlFor={`rating-${productId}`}>Nota para {productName}</label>
      <select id={`rating-${productId}`} name="rating" defaultValue="5">
        {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} estrelas</option>)}
      </select>
      <label htmlFor={`comment-${productId}`}>Comentário (opcional)</label>
      <textarea id={`comment-${productId}`} name="comment" maxLength={2000} rows={3} />
      <button type="submit">Enviar avaliação</button>
      {message && <p role="alert">{message}</p>}
    </form>
  );
}
