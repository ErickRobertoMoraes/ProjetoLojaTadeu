import { describe, expect, it } from "vitest";
import { canSetCartQuantity, isCartVariantAvailable, parseCartChange } from "./cart";

const variantId = "10000000-0000-4000-8000-000000000001";

describe("cart input and availability", () => {
  it("normalizes valid changes and rejects invalid identifiers or quantities", () => {
    expect(parseCartChange({ variant_id: variantId, quantity: 2 })).toEqual({ variant_id: variantId, quantity: 2 });
    for (const input of [null, [], {}, { variant_id: "nope", quantity: 1 },
      { variant_id: variantId, quantity: 0 }, { variant_id: variantId, quantity: 1.5 },
      { variant_id: variantId, quantity: 100 }]) expect(parseCartChange(input)).toBeNull();
  });

  it("limits quantity to current available stock", () => {
    expect(canSetCartQuantity(3, 3)).toBe(true);
    expect(canSetCartQuantity(4, 3)).toBe(false);
    expect(canSetCartQuantity(1, 0)).toBe(false);
  });

  it("requires an active variant, product, and category", () => {
    expect(isCartVariantAvailable({ active: true, stock: 2, product: { active: true, category: { active: true } } })).toBe(true);
    expect(isCartVariantAvailable({ active: true, stock: 2, product: { active: false, category: { active: true } } })).toBe(false);
    expect(isCartVariantAvailable({ active: true, stock: 0, product: { active: true, category: { active: true } } })).toBe(false);
  });
});
