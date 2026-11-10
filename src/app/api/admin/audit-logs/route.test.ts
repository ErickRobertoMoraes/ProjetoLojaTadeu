import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getAdmin: vi.fn(), select: vi.fn(), order: vi.fn(), limit: vi.fn(), eq: vi.fn() }));
vi.mock("@/lib/commerce/admin", () => ({ getActiveAdminClient: mocks.getAdmin }));
import { GET } from "./route";

describe("GET /api/admin/audit-logs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdmin.mockResolvedValue({ client: { from: () => ({ select: mocks.select }) }, response: null });
    mocks.select.mockReturnValue({ order: mocks.order });
    mocks.order.mockReturnValue({ limit: mocks.limit });
    mocks.limit.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockResolvedValue({ data: [{ action: "orders.update", entity: "orders" }], error: null });
  });

  it("rejects a non-admin and validates the query bounds", async () => {
    mocks.getAdmin.mockResolvedValueOnce({ client: null, response: Response.json({ error: "forbidden" }, { status: 403 }) });
    expect((await GET(new Request("http://local/api/admin/audit-logs"))).status).toBe(403);
    mocks.getAdmin.mockResolvedValue({ client: { from: () => ({ select: mocks.select }) }, response: null });
    expect((await GET(new Request("http://local/api/admin/audit-logs?limit=500"))).status).toBe(400);
    expect((await GET(new Request("http://local/api/admin/audit-logs?entity=auth.users"))).status).toBe(400);
  });

  it("returns the selected entity logs for an administrator", async () => {
    const response = await GET(new Request("http://local/api/admin/audit-logs?entity=orders&limit=25"));
    expect(response.status).toBe(200);
    expect(mocks.limit).toHaveBeenCalledWith(25);
    expect(mocks.eq).toHaveBeenCalledWith("entity", "orders");
  });
});
