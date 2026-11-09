import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getAdmin: vi.fn(), select: vi.fn(), order: vi.fn(), range: vi.fn(), eq: vi.fn() }));
vi.mock("@/lib/commerce/admin", () => ({ getActiveAdminClient: mocks.getAdmin }));
import { GET } from "./route";

describe("GET /api/admin/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdmin.mockResolvedValue({ client: { from: () => ({ select: mocks.select }) }, response: null });
    mocks.select.mockReturnValue({ order: mocks.order });
    mocks.order.mockReturnValue({ range: mocks.range });
    mocks.range.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockResolvedValue({ data: [{ id: "order-1", total_cents: 2500 }], error: null, count: 1 });
  });

  it("requires an active administrator", async () => {
    mocks.getAdmin.mockResolvedValue({ client: null, response: Response.json({ error: "forbidden" }, { status: 403 }) });
    expect((await GET(new Request("http://local/api/admin/orders"))).status).toBe(403);
  });

  it("validates filters and returns a bounded order page", async () => {
    expect((await GET(new Request("http://local/api/admin/orders?status=unknown"))).status).toBe(400);
    const response = await GET(new Request("http://local/api/admin/orders?status=shipped&page=2"));
    expect(response.status).toBe(200);
    expect(mocks.range).toHaveBeenCalledWith(50, 99);
    expect(mocks.eq).toHaveBeenCalledWith("status", "shipped");
    expect(await response.json()).toMatchObject({ page: 2, page_size: 50, total: 1 });
  });
});
