import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getAdmin: vi.fn(), insert: vi.fn(), select: vi.fn(), single: vi.fn() }));

vi.mock("@/lib/catalog/admin", () => ({
  getCatalogAdminClient: mocks.getAdmin,
  mapCatalogWriteError: () => Response.json({ error: "write_failed" }, { status: 503 }),
}));

import { POST } from "./route";

const productId = "70000000-0000-4000-8000-000000000001";

describe("POST /api/admin/catalog/products/:id/variants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.single.mockResolvedValue({ data: { id: "variant-id", sku: "TEE-M", stock: 0 }, error: null });
    mocks.select.mockReturnValue({ single: mocks.single });
    mocks.insert.mockReturnValue({ select: mocks.select });
    mocks.getAdmin.mockResolvedValue({
      response: null,
      client: { from: () => ({ insert: mocks.insert }) },
    });
  });

  it("rejects a malformed variant before writing", async () => {
    const response = await POST(new Request("http://localhost", {
      method: "POST", body: JSON.stringify({ sku: "TEE-M", attributes: {}, price_cents: -1, stock: 2 }),
    }), { params: Promise.resolve({ id: productId }) });
    expect(response.status).toBe(400);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("returns the authorization response without writing for non-admins", async () => {
    mocks.getAdmin.mockResolvedValue({ client: null, response: Response.json({ error: "forbidden" }, { status: 403 }) });
    const response = await POST(new Request("http://localhost", {
      method: "POST", body: JSON.stringify({ sku: "TEE-M", attributes: {}, price_cents: 4990, stock: 0 }),
    }), { params: Promise.resolve({ id: productId }) });
    expect(response.status).toBe(403);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("creates valid zero-stock variants for an active admin", async () => {
    const response = await POST(new Request("http://localhost", {
      method: "POST", body: JSON.stringify({ sku: "TEE-M", attributes: { Size: "M" }, price_cents: 4990, stock: 0 }),
    }), { params: Promise.resolve({ id: productId }) });
    expect(response.status).toBe(201);
    expect(mocks.insert).toHaveBeenCalledWith({ sku: "TEE-M", attributes: { Size: "M" }, price_cents: 4990, stock: 0, active: true, product_id: productId });
  });
});
