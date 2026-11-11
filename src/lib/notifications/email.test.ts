import { describe, expect, it, vi } from "vitest";
import { orderEmail, requestEmail } from "./email";

describe("transactional email adapter", () => {
  it("builds concise event messages without exposing full order identifiers", () => {
    expect(orderEmail("cliente@example.test", "12345678-0000-4000-8000-000000000000", "delivered", "order.status_changed"))
      .toEqual({
        to: "cliente@example.test",
        event: "order.status_changed",
        subject: "Status do pedido atualizado · FitStore",
        text: "Status do pedido atualizado. Pedido 12345678: delivered. Acompanhe sua conta FitStore.",
      });
  });

  it("requests delivery through the injected adapter and contains adapter failures", async () => {
    const adapter = vi.fn().mockRejectedValue(new Error("transport unavailable"));
    await expect(requestEmail(orderEmail("c@example.test", "order-1", "payment_approved", "order.created"), adapter)).resolves.toBeUndefined();
    expect(adapter).toHaveBeenCalledOnce();
  });
});
