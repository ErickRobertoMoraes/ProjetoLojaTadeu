import { describe, expect, it, vi } from "vitest";
import { requireConfirmedEmailForCheckout } from "./authorization";

describe("checkout confirmation boundary", () => {
  it("denies anonymous users", async () => {
    const auth = { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) };
    await expect(requireConfirmedEmailForCheckout(auth)).resolves.toEqual({
      allowed: false,
      reason: "unauthenticated",
    });
  });

  it("denies authenticated users whose email is not confirmed", async () => {
    const auth = {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "customer", email_confirmed_at: null } } }),
    };
    await expect(requireConfirmedEmailForCheckout(auth)).resolves.toEqual({
      allowed: false,
      reason: "email_unconfirmed",
    });
  });

  it("allows a user with a confirmed email", async () => {
    const user = { id: "customer", email_confirmed_at: "2026-10-22T00:00:00Z" };
    const auth = { getUser: vi.fn().mockResolvedValue({ data: { user } }) };
    await expect(requireConfirmedEmailForCheckout(auth)).resolves.toEqual({ allowed: true, user });
  });
});
