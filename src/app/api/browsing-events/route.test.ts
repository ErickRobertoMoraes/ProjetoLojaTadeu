import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn(), select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(), limit: vi.fn(), insert: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser }, from: mocks.from })),
}));

function request(body: unknown) {
  return new Request("http://localhost/api/browsing-events", { method: "POST", body: JSON.stringify(body) });
}

describe("POST /api/browsing-events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: "customer" } } });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ eq: mocks.eq, maybeSingle: mocks.maybeSingle, limit: mocks.limit });
    mocks.maybeSingle.mockResolvedValue({ data: { id: "active" }, error: null });
    mocks.limit.mockResolvedValue({ data: [{ id: "active" }], error: null });
    mocks.insert.mockResolvedValue({ error: null });
    mocks.from.mockImplementation(() => ({ select: mocks.select, insert: mocks.insert }));
  });

  it("requires authentication and validates structured signals", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    expect((await POST(request({ product_id: "17000000-0000-4000-8000-000000000001" }))).status).toBe(401);
    expect((await POST(request({ product_id: "bad", customer_id: "other" }))).status).toBe(400);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("records a product view using the authenticated user id", async () => {
    const response = await POST(request({ product_id: "17000000-0000-4000-8000-000000000001" }));
    expect(response.status).toBe(201);
    expect(mocks.from).toHaveBeenNthCalledWith(1, "products");
    expect(mocks.from).toHaveBeenNthCalledWith(2, "browsing_events");
    expect(mocks.insert).toHaveBeenCalledWith({ customer_id: "customer", event_type: "view", product_id: "17000000-0000-4000-8000-000000000001" });
  });

  it("records a selected category and rejects unknown goals", async () => {
    expect((await POST(request({ category_id: "17000000-0000-4000-8000-000000000002" }))).status).toBe(201);
    expect(mocks.insert).toHaveBeenCalledWith({ customer_id: "customer", event_type: "category", category_id: "17000000-0000-4000-8000-000000000002" });
    mocks.limit.mockResolvedValue({ data: [], error: null });
    expect((await POST(request({ training_goal: "inventado" }))).status).toBe(404);
  });
});
