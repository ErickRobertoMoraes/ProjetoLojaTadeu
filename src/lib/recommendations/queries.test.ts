import { describe, expect, it, vi } from "vitest";
import { getCustomerRecommendations } from "./queries";

type QueryResult = { data: unknown[]; error: null };
type QueryBuilder = Pick<Promise<QueryResult>, "then"> & {
  select: (...args: unknown[]) => QueryBuilder;
  eq: (...args: unknown[]) => QueryBuilder;
  neq: (...args: unknown[]) => QueryBuilder;
  order: (...args: unknown[]) => QueryBuilder;
  limit: (...args: unknown[]) => QueryBuilder;
};

function query(result: QueryResult) {
  const builder = {} as QueryBuilder;
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.neq = vi.fn(() => builder);
  builder.order = vi.fn(() => builder);
  builder.limit = vi.fn(() => builder);
  const resolved = Promise.resolve(result);
  builder.then = resolved.then.bind(resolved);
  return builder;
}

describe("getCustomerRecommendations", () => {
  it("uses only the requested customer's events and purchase history", async () => {
    const events = query({ data: [{ event_type: "view", product_id: "viewed", category_id: null, training_goal: null,
      product: { name: "Camiseta", category_id: "category-a", training_goal: "Força" } }], error: null });
    const orders = query({ data: [], error: null });
    const products = query({ data: [
      { id: "viewed", name: "Camiseta", slug: "camiseta", category_id: "category-a", training_goal: "Força", featured: false,
        variants: [{ active: true, stock: 2 }], images: [] },
      { id: "related", name: "Bermuda", slug: "bermuda", category_id: "category-a", training_goal: "Força", featured: false,
        variants: [{ active: true, stock: 2 }], images: [] },
    ], error: null });
    const client = { from: vi.fn((table: string) => table === "browsing_events" ? events : table === "orders" ? orders : products) };

    const result = await getCustomerRecommendations(client as never, "customer-a");

    expect(events.eq).toHaveBeenCalledWith("customer_id", "customer-a");
    expect(orders.eq).toHaveBeenCalledWith("customer_id", "customer-a");
    expect(orders.neq).toHaveBeenCalledWith("status", "cancelled");
    expect(result.recommendations.map(({ product }) => product.id)).toEqual(["related"]);
    expect(result.recommendations[0].reason).toContain("Camiseta");
  });
});
