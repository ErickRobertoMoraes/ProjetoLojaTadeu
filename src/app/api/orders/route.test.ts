import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), rpc: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser }, rpc: mocks.rpc })),
}));

function makeRequest(body: unknown = { payment_method: "pix" }) {
  return new Request("http://localhost/api/orders", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}

describe("POST /api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: "customer", email_confirmed_at: "2026-10-01T00:00:00Z" } } });
    mocks.rpc.mockResolvedValue({ data: { order_id: "order-1", status: "payment_approved", total_cents: 5799 }, error: null });
  });

  it("requires authentication and a confirmed email before creating an order", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    expect((await POST(makeRequest())).status).toBe(401);
    mocks.getUser.mockResolvedValue({ data: { user: { id: "customer", email_confirmed_at: null } } });
    expect((await POST(makeRequest())).status).toBe(403);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("accepts only simulated methods and delegates the transaction with the coupon", async () => {
    expect((await POST(makeRequest({ payment_method: "gateway" }))).status).toBe(400);
    const response = await POST(makeRequest({ payment_method: "pix", coupon_code: " FIT10 " }));
    expect(response.status).toBe(201);
    expect(mocks.rpc).toHaveBeenCalledWith("create_simulated_order", {
      p_payment_method: "pix", p_coupon_code: "FIT10",
    });
    expect(await response.json()).toMatchObject({ order: { status: "payment_approved", total_cents: 5799 } });
  });

  it("returns transaction conflicts without exposing database details", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "P0001", message: "cart_item_unavailable", details: "internal" } });
    const response = await POST(makeRequest());
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "cart_item_unavailable" });
  });
});
