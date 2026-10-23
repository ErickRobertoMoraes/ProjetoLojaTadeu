import { NextResponse } from "next/server";
import { CATALOG_PAGE_SIZE, parseCatalogFilters } from "@/lib/catalog/catalog";
import { listCatalogProducts } from "@/lib/catalog/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const filters = parseCatalogFilters(new URL(request.url).searchParams);
  if (!filters) return NextResponse.json({ error: "validation_failed" }, { status: 400 });

  try {
    const supabase = await createSupabaseServerClient();
    const { products, total, error } = await listCatalogProducts(supabase, filters);
    if (error) return NextResponse.json({ error: "catalog_unavailable" }, { status: 503 });

    return NextResponse.json({
      products,
      pagination: {
        page: filters.page,
        pageSize: CATALOG_PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / CATALOG_PAGE_SIZE),
      },
    });
  } catch {
    return NextResponse.json({ error: "catalog_unavailable" }, { status: 503 });
  }
}
