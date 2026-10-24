export const CATALOG_PAGE_SIZE = 12;
const MAX_PAGE = 10_000;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CatalogFilters = {
  query: string;
  category: string;
  brand: string;
  objective: string;
  minPrice: number | null;
  maxPrice: number | null;
  page: number;
};

export type CatalogCategoryInput = { name: string; slug: string; active: boolean };
export type CatalogProductInput = {
  category_id: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string;
  training_goal: string | null;
  active: boolean;
  featured: boolean;
};

export type CatalogProduct = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string;
  training_goal: string | null;
  active: boolean;
  featured: boolean;
  category: { id: string; name: string; slug: string } | null;
  variants: CatalogVariant[];
  images?: CatalogImage[];
};

export type CatalogVariant = {
  id?: string;
  product_id?: string;
  sku: string;
  attributes: Record<string, string>;
  price_cents: number;
  stock: number;
  active: boolean;
};

export type CatalogImage = {
  id: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
};

export type CatalogCategory = { id: string; name: string; slug: string; active: boolean };

function readPrice(value: string | null): number | null | false {
  if (value === null || value.trim() === "") return null;
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized) || (value.includes(",") && value.includes("."))) return false;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0 || amount > 2_147_483_647 / 100) return false;
  return Math.round(amount * 100);
}

export function parseCatalogFilters(params: URLSearchParams): CatalogFilters | null {
  const query = (params.get("q") ?? "").trim().slice(0, 100);
  const category = (params.get("category") ?? "").trim();
  const brand = (params.get("brand") ?? "").trim().slice(0, 120);
  const objective = (params.get("objective") ?? "").trim().slice(0, 120);
  const minPrice = readPrice(params.get("min_price"));
  const maxPrice = readPrice(params.get("max_price"));
  const pageText = params.get("page") ?? "1";
  const page = /^\d+$/.test(pageText) ? Number(pageText) : Number.NaN;

  if (
    (category && !SLUG_PATTERN.test(category)) || minPrice === false || maxPrice === false ||
    (minPrice !== null && maxPrice !== null && minPrice > maxPrice) ||
    !Number.isSafeInteger(page) || page < 1 || page > MAX_PAGE
  ) return null;

  return { query, category, brand, objective, minPrice, maxPrice, page };
}

export function parseCatalogCategory(value: unknown): CatalogCategoryInput | null {
  if (!isRecord(value)) return null;
  const name = readText(value.name, 100);
  const slug = readText(value.slug, 100);
  if (!name || !slug || !SLUG_PATTERN.test(slug)) return null;
  return { name, slug, active: value.active !== false };
}

export function parseCatalogProduct(value: unknown): CatalogProductInput | null {
  if (!isRecord(value)) return null;
  const categoryId = readText(value.category_id, 36);
  const name = readText(value.name, 180);
  const slug = readText(value.slug, 180);
  const brand = optionalText(value.brand, 120);
  const description = typeof value.description === "string" ? value.description.trim() : "";
  const trainingGoal = optionalText(value.training_goal, 120);

  if (!categoryId || !UUID_PATTERN.test(categoryId) || !name || !slug || !SLUG_PATTERN.test(slug)) return null;
  if (typeof value.description !== "string" || description.length > 10_000) return null;
  if (brand === false || trainingGoal === false) return null;

  return {
    category_id: categoryId,
    name,
    slug,
    brand,
    description,
    training_goal: trainingGoal,
    active: value.active !== false,
    featured: value.featured === true,
  };
}

export function parseCatalogVariant(value: unknown): Omit<CatalogVariant, "id" | "product_id"> | null {
  if (!isRecord(value)) return null;
  const sku = readText(value.sku, 80);
  const price = value.price_cents;
  const stock = value.stock;
  const attributes = value.attributes;
  if (!sku || !Number.isSafeInteger(price) || (price as number) < 0 || (price as number) > 2_147_483_647) return null;
  if (!Number.isSafeInteger(stock) || (stock as number) < 0 || (stock as number) > 2_147_483_647) return null;
  if (!isRecord(attributes) || Object.keys(attributes).length > 20) return null;
  const normalizedAttributes: Record<string, string> = {};
  for (const [key, rawValue] of Object.entries(attributes)) {
    const normalizedKey = key.trim();
    if (!normalizedKey || normalizedKey.length > 40 || typeof rawValue !== "string" || rawValue.trim().length < 1 || rawValue.trim().length > 80) return null;
    normalizedAttributes[normalizedKey] = rawValue.trim();
  }
  return { sku, attributes: normalizedAttributes, price_cents: price as number, stock: stock as number, active: value.active !== false };
}

export function parseProductImageAltText(value: unknown): string | null {
  if (!isRecord(value)) return null;
  return readText(value.alt_text, 240);
}

export function getCatalogOffset(page: number): number {
  return (page - 1) * CATALOG_PAGE_SIZE;
}

export function buildCatalogSearchFilter(term: string): string {
  const escaped = term.replace(/[\\"%_*]/g, "\\$&");
  const pattern = `"*${escaped}*"`;
  return ["name", "brand", "description", "training_goal"]
    .map((column) => `${column}.ilike.${pattern}`)
    .join(",");
}

export function isActiveCatalogAdmin(
  profile: { role: string; active: boolean } | null,
  error: unknown,
): boolean {
  return !error && profile?.role === "admin" && profile.active;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const result = value.trim();
  return result.length > 0 && result.length <= maxLength ? result : null;
}

function optionalText(value: unknown, maxLength: number): string | null | false {
  if (value === null || value === undefined || value === "") return null;
  return readText(value, maxLength) ?? false;
}
