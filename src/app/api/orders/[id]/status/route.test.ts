import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH } from "./route";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), requestEmail: vi.fn(), getUserById: vi.fn(), maybeSingle: vi.fn(), eq: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ rpc: mocks.rpc })),
}));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminClient: () => ({
  from: () => ({ select: () => ({ eq: mocks.eq }) }),
  auth: { admin: { getUserById: mocks.getUserById } },
}) }));
vi.mock("@/lib/notifications/email", () => ({
  orderEmail: (to: string, orderId: string, status: string, event: string) => ({ to, orderId, status, event }),
  requestEmail: mocks.requestEmail,
}));

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/orders/order-1/status", {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}

describe("PATCH /api/orders/[id]/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requestEmail.mockResolvedValue(undefined);
    mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
    mocks.maybeSingle.mockResolvedValue({ data: { customer_id: "customer" }, error: null });
    mocks.getUserById.mockResolvedValue({ data: { user: { email: "customer@example.test" } }, error: null });
    mocks.rpc.mockResolvedValue({ data: { order_id: "order-1", status: "shipped" }, error: null });
  });

  it("validates target status and delegates authorization and transition rules to the database", async () => {
    expect((await PATCH(makeRequest({ status: "payment_approved" }), { params: Promise.resolve({ id: "order-1" }) })).status).toBe(400);
    const response = await PATCH(makeRequest({ status: "shipped" }), { params: Promise.resolve({ id: "order-1" }) });
    expect(response.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("transition_order_status", { p_order_id: "order-1", p_status: "shipped" });
    expect(mocks.requestEmail).toHaveBeenCalledWith({
      to: "customer@example.test", orderId: "order-1", status: "shipped", event: "order.status_changed",
    });
  });

  it("maps forbidden transitions without exposing database details", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "P0001", message: "invalid_order_transition", details: "private" } });
    const response = await PATCH(makeRequest({ status: "delivered" }), { params: Promise.resolve({ id: "order-1" }) });
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "invalid_order_transition" });
  });
});
