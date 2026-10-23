import { describe, expect, it } from "vitest";
import {
  buildCatalogSearchFilter,
  getCatalogOffset,
  isActiveCatalogAdmin,
  parseCatalogCategory,
  parseCatalogFilters,
  parseCatalogProduct,
} from "./catalog";

describe("catalog filters", () => {
  it("parses search filters, prices, and pagination", () => {
    expect(parseCatalogFilters(new URLSearchParams(
      "q=camiseta&category=roupas&brand=Fit&objective=forca&min_price=39.9&max_price=120&page=2",
    ))).toEqual({
      query: "camiseta", category: "roupas", brand: "Fit", objective: "forca",
      minPrice: 3990, maxPrice: 12000, page: 2,
    });
    expect(getCatalogOffset(2)).toBe(12);
    expect(parseCatalogFilters(new URLSearchParams("min_price=39,90"))?.minPrice).toBe(3990);
  });

  it.each([
    "category=Roupas", "min_price=-1", "min_price=12.999", "min_price=20&max_price=10", "page=0", "page=1x",
  ])("rejects unsafe or invalid query parameters: %s", (query) => {
    expect(parseCatalogFilters(new URLSearchParams(query))).toBeNull();
  });

  it("escapes PostgREST search grammar characters", () => {
    const filter = buildCatalogSearchFilter('x",id.eq.anything\\%_*');
    expect(filter).toContain('name.ilike."*x\\",id.eq.anything\\\\\\%\\_\\**"');
    expect(filter.match(/[a-z_]+\.ilike\./g)).toHaveLength(4);
  });
});

describe("catalog admin input validation", () => {
  it("accepts and normalizes category fields", () => {
    expect(parseCatalogCategory({ name: "  Roupas  ", slug: "roupas", active: true })).toEqual({
      name: "Roupas", slug: "roupas", active: true,
    });
  });

  it.each([
    null,
    [],
    {},
    { name: "", slug: "roupas" },
    { name: "Categoria", slug: "Roupas" },
  ])("rejects malformed categories", (input) => {
    expect(parseCatalogCategory(input)).toBeNull();
  });

  it("accepts only known product fields and a valid category identifier", () => {
    expect(parseCatalogProduct({
      category_id: "60000000-0000-4000-8000-000000000001",
      name: "Camiseta", slug: "camiseta", brand: "FitStore", description: "Leve",
      training_goal: "forca", active: true, featured: true,
    })).toEqual({
      category_id: "60000000-0000-4000-8000-000000000001",
      name: "Camiseta", slug: "camiseta", brand: "FitStore", description: "Leve",
      training_goal: "forca", active: true, featured: true,
    });
    expect(parseCatalogProduct({ category_id: "bad", name: "Camiseta", slug: "camiseta", description: "" })).toBeNull();
  });
});

describe("catalog authorization", () => {
  it("allows only active administrators", () => {
    expect(isActiveCatalogAdmin({ role: "admin", active: true }, null)).toBe(true);
    expect(isActiveCatalogAdmin({ role: "customer", active: true }, null)).toBe(false);
    expect(isActiveCatalogAdmin({ role: "admin", active: false }, null)).toBe(false);
    expect(isActiveCatalogAdmin({ role: "admin", active: true }, new Error("RLS lookup failed"))).toBe(false);
    expect(isActiveCatalogAdmin(null, null)).toBe(false);
  });
});
