import { NextResponse } from "next/server";
import { getCatalogAdminClient, mapCatalogWriteError } from "@/lib/catalog/admin";
import { parseCatalogProduct } from "@/lib/catalog/catalog";

export async function GET() {
  const authorization = await getCatalogAdminClient();
  if (authorization.response) return authorization.response;
  const { data, error } = await authorization.client.from("products")
    .select("id, category_id, name, slug, brand, description, training_goal, active, featured, category:categories(id, name, slug)")
    .order("updated_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: "catalog_unavailable" }, { status: 503 });
  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const input = parseCatalogProduct(body);
  if (!input) return NextResponse.json({ error: "validation_failed" }, { status: 400 });

  const authorization = await getCatalogAdminClient();
  if (authorization.response) return authorization.response;
  const { data, error } = await authorization.client.from("products").insert(input)
    .select("id, category_id, name, slug, brand, description, training_goal, active, featured").single();
  if (error) return mapCatalogWriteError(error.code);
  return NextResponse.json({ product: data }, { status: 201 });
}
