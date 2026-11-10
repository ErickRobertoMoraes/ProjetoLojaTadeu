import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

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

describe("POST /api/orders/[id]/cancel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requestEmail.mockResolvedValue(undefined);
    mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
    mocks.maybeSingle.mockResolvedValue({ data: { customer_id: "customer" }, error: null });
    mocks.getUserById.mockResolvedValue({ data: { user: { email: "customer@example.test" } }, error: null });
    mocks.rpc.mockResolvedValue({ data: { order_id: "order-1", status: "cancelled" }, error: null });
  });

  it("requests the atomic cancellation transition", async () => {
    const response = await POST(new Request("http://localhost/api/orders/order-1/cancel", { method: "POST" }), {
      params: Promise.resolve({ id: "order-1" }),
    });
    expect(response.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("transition_order_status", { p_order_id: "order-1", p_status: "cancelled" });
    expect(mocks.requestEmail).toHaveBeenCalledWith({
      to: "customer@example.test", orderId: "order-1", status: "cancelled", event: "order.cancelled",
    });
  });

  it("returns a conflict when an order is no longer cancellable", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "P0001", message: "invalid_order_transition" } });
    const response = await POST(new Request("http://localhost/api/orders/order-1/cancel", { method: "POST" }), {
      params: Promise.resolve({ id: "order-1" }),
    });
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "invalid_order_transition" });
  });
});
