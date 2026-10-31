import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn(), records: {} as Record<string, unknown> }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser }, from: mocks.from })),
}));

function makeRequest(body: unknown = {}) {
  return new Request("http://localhost/api/checkout/quote", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}

function setup() {
  mocks.getUser.mockResolvedValue({ data: { user: { id: "20000000-0000-4000-8000-000000000001", email_confirmed_at: "2026-10-01T00:00:00Z" } } });
  mocks.from.mockImplementation((table: string) => {
    const result = mocks.records[table] ?? { data: null, error: null };
    const query: Record<string, unknown> = {};
    query.select = vi.fn(() => query);
    query.eq = vi.fn(() => query);
    query.order = vi.fn(() => Promise.resolve(result));
    query.maybeSingle = vi.fn(() => Promise.resolve(result));
    return query;
  });
}

describe("POST /api/checkout/quote", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.records = {}; setup(); });

  it("requires authentication and confirmed email before reading checkout data", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    expect((await POST(makeRequest())).status).toBe(401);
    mocks.getUser.mockResolvedValue({ data: { user: { id: "customer", email_confirmed_at: null } } });
    const response = await POST(makeRequest());
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "email_unconfirmed" });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("recalculates item subtotal, coupon discount, shipping, and total from stored data", async () => {
    mocks.records.addresses = { data: { postal_code: "01001-000", city: "São Paulo", state: "SP", shipping_region: "sp" }, error: null };
    mocks.records.cart_items = { data: [{ quantity: 2, variant: {
      sku: "CAMISETA-M", attributes: { tamanho: "M" }, price_cents: 2500, stock: 4, active: true,
      product: { name: "Camiseta", active: true, category: { active: true } },
    } }], error: null };
    mocks.records.coupons = { data: {
      code: "FIT10", discount_percent: 10, starts_at: "2026-01-01T00:00:00.000Z", ends_at: "2027-01-01T00:00:00.000Z",
      minimum_order_cents: 1000, usage_limit: 10, usage_count: 2, active: true,
    }, error: null };
    mocks.records.shipping_regions = { data: { code: "sp", name: "São Paulo", price_cents: 799, delivery_days: 3, active: true }, error: null };

    const response = await POST(makeRequest({ coupon_code: " fit10 " }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ quote: {
      subtotal_cents: 5000, discount_cents: 500, shipping: { price_cents: 799, delivery_days: 3 }, total_cents: 5299,
      coupon: { code: "FIT10" }, address: { city: "São Paulo", state: "SP" },
    } });
  });

  it("rejects malformed coupon input and items that exceed current stock", async () => {
    expect((await POST(makeRequest({ coupon_code: 42 }))).status).toBe(400);
    mocks.records.addresses = { data: { postal_code: "01001-000", city: "São Paulo", state: "SP", shipping_region: "sp" }, error: null };
    mocks.records.cart_items = { data: [{ quantity: 5, variant: {
      sku: "CAMISETA-M", attributes: {}, price_cents: 2500, stock: 4, active: true,
      product: { name: "Camiseta", active: true, category: { active: true } },
    } }], error: null };
    const response = await POST(makeRequest());
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "cart_item_unavailable" });
  });
});
