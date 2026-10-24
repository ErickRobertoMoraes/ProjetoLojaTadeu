import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getAdmin: vi.fn(), insert: vi.fn(), select: vi.fn(), single: vi.fn() }));

vi.mock("@/lib/commerce/admin", () => ({
  getActiveAdminClient: mocks.getAdmin,
  mapCommerceWriteError: () => Response.json({ error: "write_failed" }, { status: 503 }),
}));

import { POST } from "./route";

const validCoupon = {
  code: "FIT10",
  discount_percent: 10,
  starts_at: "2026-10-24T00:00:00-03:00",
  ends_at: "2026-11-01T00:00:00-03:00",
  minimum_order_cents: 0,
  usage_limit: 100,
  active: true,
};

function request(body: unknown): Request {
  return new Request("http://localhost/api/admin/coupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/coupons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdmin.mockResolvedValue({ client: { from: () => ({ insert: mocks.insert }) }, response: null });
    mocks.insert.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ single: mocks.single });
    mocks.single.mockResolvedValue({ data: { id: "coupon-id", ...validCoupon }, error: null });
  });

  it("rejects invalid coupon rules before checking authorization or writing", async () => {
    const response = await POST(request({ ...validCoupon, discount_percent: 100.01 }));
    expect(response.status).toBe(400);
    expect(mocks.getAdmin).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("returns 401 for an anonymous caller", async () => {
    mocks.getAdmin.mockResolvedValue({ client: null, response: Response.json({ error: "unauthenticated" }, { status: 401 }) });
    const response = await POST(request(validCoupon));
    expect(response.status).toBe(401);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("returns 403 for a customer", async () => {
    mocks.getAdmin.mockResolvedValue({ client: null, response: Response.json({ error: "forbidden" }, { status: 403 }) });
    const response = await POST(request(validCoupon));
    expect(response.status).toBe(403);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("normalizes and creates a valid coupon for an administrator", async () => {
    const response = await POST(request({ ...validCoupon, code: " fit10 " }));
    expect(response.status).toBe(201);
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ code: "FIT10" }));
  });
});
