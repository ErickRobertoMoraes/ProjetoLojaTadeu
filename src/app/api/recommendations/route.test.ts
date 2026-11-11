import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), getRecommendations: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock("@/lib/recommendations/queries", () => ({ getCustomerRecommendations: mocks.getRecommendations }));

describe("GET /api/recommendations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: "customer-a" } } });
    mocks.getRecommendations.mockResolvedValue({ recommendations: [{ product: { id: "p1" }, reason: "Porque você viu um item relacionado." }], error: false });
  });

  it("requires an authenticated customer", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    expect((await GET()).status).toBe(401);
    expect(mocks.getRecommendations).not.toHaveBeenCalled();
  });

  it("queries only the authenticated customer's signals and returns explanations", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(mocks.getRecommendations).toHaveBeenCalledWith(expect.anything(), "customer-a");
    expect(await response.json()).toEqual({ recommendations: [{ product: { id: "p1" }, reason: "Porque você viu um item relacionado." }] });
  });

  it("does not leak database errors", async () => {
    mocks.getRecommendations.mockResolvedValue({ recommendations: [], error: true });
    expect(await (await GET()).json()).toEqual({ error: "recommendations_unavailable" });
  });
});
