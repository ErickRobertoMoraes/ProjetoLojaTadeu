import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), insert: vi.fn(), select: vi.fn(), single: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
    from: () => ({ insert: mocks.insert }),
  })),
}));

const valid = {
  order_id: "13000000-0000-4000-8000-000000000020",
  product_id: "13000000-0000-4000-8000-000000000011",
  rating: 5,
  comment: "Muito bom",
};

function request(body: unknown) {
  return new Request("http://localhost/api/reviews", { method: "POST", body: JSON.stringify(body) });
}

describe("POST /api/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: "customer" } } });
    mocks.insert.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ single: mocks.single });
    mocks.single.mockResolvedValue({ data: { id: "review-1", rating: 5 }, error: null });
  });

  it("validates rating and required purchase identifiers", async () => {
    expect((await POST(request({ ...valid, rating: 6 }))).status).toBe(400);
    expect((await POST(request({ ...valid, order_id: "bad" }))).status).toBe(400);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("creates a review for the authenticated customer and relies on database eligibility policies", async () => {
    const response = await POST(request(valid));
    expect(response.status).toBe(201);
    expect(mocks.insert).toHaveBeenCalledWith({ customer_id: "customer", ...valid });
  });

  it("maps an ineligible delivered purchase without exposing database details", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { code: "42501", message: "private database detail" } });
    const response = await POST(request(valid));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "review_not_eligible" });
  });

  it("rejects duplicate product reviews", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { code: "23505", message: "duplicate" } });
    expect((await POST(request(valid))).status).toBe(409);
  });
});
