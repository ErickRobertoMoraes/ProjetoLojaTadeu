export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  event: "order.created" | "order.status_changed" | "order.cancelled";
};

export type EmailAdapter = (message: EmailMessage) => Promise<void>;

export async function sendTransactionalEmail(message: EmailMessage): Promise<void> {
  const endpoint = process.env.TRANSACTIONAL_EMAIL_ENDPOINT;
  const token = process.env.TRANSACTIONAL_EMAIL_TOKEN;
  if (!endpoint || !token) return;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(message),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("email_delivery_failed");
}

export async function requestEmail(message: EmailMessage, adapter: EmailAdapter = sendTransactionalEmail): Promise<void> {
  try {
    await adapter(message);
  } catch {
    // Delivery failure must not undo an order transition that has already committed.
  }
}

export function orderEmail(
  to: string,
  orderId: string,
  status: string,
  event: EmailMessage["event"],
): EmailMessage {
  const labels: Record<EmailMessage["event"], string> = {
    "order.created": "Pedido criado",
    "order.status_changed": "Status do pedido atualizado",
    "order.cancelled": "Pedido cancelado",
  };
  return {
    to,
    event,
    subject: `${labels[event]} · FitStore`,
    text: `${labels[event]}. Pedido ${orderId.slice(0, 8)}: ${status}. Acompanhe sua conta FitStore.`,
  };
}
