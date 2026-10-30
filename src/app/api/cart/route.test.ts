import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser }, from: mocks.from })),
}));

describe("cart route authentication and validation", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("does not expose a cart to anonymous users", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const response = await GET();
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthenticated" });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("rejects malformed changes before querying data", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "20000000-0000-4000-8000-000000000001" } } });
    const response = await POST(new Request("http://localhost/api/cart", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variant_id: "invalid", quantity: 1 }),
    }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "validation_failed" });
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
