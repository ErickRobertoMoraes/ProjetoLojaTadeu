import { CATALOG_PAGE_SIZE, buildCatalogSearchFilter, getCatalogOffset, type CatalogFilters, type CatalogProduct } from "./catalog";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listCatalogProducts(client: SupabaseClient, filters: CatalogFilters) {
  const priceFiltered = filters.minPrice !== null || filters.maxPrice !== null;
  const variantSelection = priceFiltered
    ? "variants:product_variants!inner(price_cents, active)"
    : "variants:product_variants(price_cents, active)";
  let query = client
    .from("products")
    .select(`id, category_id, name, slug, brand, description, training_goal, active, featured, category:categories!inner(id, name, slug), ${variantSelection}`, { count: "exact" })
    .eq("active", true)
    .eq("category.active", true)
    .eq("variants.active", true)
    .order("featured", { ascending: false })
    .order("name", { ascending: true });

  if (filters.category) query = query.eq("category.slug", filters.category);
  if (filters.brand) query = query.ilike("brand", `%${escapeLike(filters.brand)}%`);
  if (filters.objective) query = query.ilike("training_goal", `%${escapeLike(filters.objective)}%`);
  if (filters.query) query = query.or(buildCatalogSearchFilter(filters.query));
  if (filters.minPrice !== null) query = query.gte("variants.price_cents", filters.minPrice);
  if (filters.maxPrice !== null) query = query.lte("variants.price_cents", filters.maxPrice);

  const offset = getCatalogOffset(filters.page);
  const { data, count, error } = await query.range(offset, offset + CATALOG_PAGE_SIZE - 1);
  return {
    products: (data ?? []) as unknown as CatalogProduct[],
    total: count ?? 0,
    error,
  };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_*]/g, "\\$&");
}
