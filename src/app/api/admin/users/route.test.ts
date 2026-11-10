import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getAdmin: vi.fn(), select: vi.fn(), order: vi.fn(), limit: vi.fn() }));
vi.mock("@/lib/commerce/admin", () => ({ getActiveAdminClient: mocks.getAdmin }));
import { GET } from "./route";

describe("GET /api/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdmin.mockResolvedValue({ client: { from: () => ({ select: mocks.select }) }, response: null });
    mocks.select.mockReturnValue({ order: mocks.order });
    mocks.order.mockReturnValue({ limit: mocks.limit });
    mocks.limit.mockResolvedValue({ data: [{ id: "profile-1", name: "Admin", role: "admin", active: true }], error: null });
  });

  it("blocks non-admin access", async () => {
    mocks.getAdmin.mockResolvedValue({ client: null, response: Response.json({ error: "unauthenticated" }, { status: 401 }) });
    expect((await GET()).status).toBe(401);
  });

  it("returns only the minimal profile fields needed for access management", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(mocks.select).toHaveBeenCalledWith("id, name, role, active, created_at");
    expect(await response.json()).toHaveProperty("users");
  });
});
