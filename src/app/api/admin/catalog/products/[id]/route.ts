import { NextResponse } from "next/server";
import { getCatalogAdminClient, mapCatalogWriteError } from "@/lib/catalog/admin";
import { parseCatalogProduct } from "@/lib/catalog/catalog";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const input = parseCatalogProduct(body);
  if (!input) return NextResponse.json({ error: "validation_failed" }, { status: 400 });

  const { id } = await context.params;
  const authorization = await getCatalogAdminClient();
  if (authorization.response) return authorization.response;
  const { data, error } = await authorization.client.from("products").update(input).eq("id", id)
    .select("id, category_id, name, slug, brand, description, training_goal, active, featured").maybeSingle();
  if (error) return mapCatalogWriteError(error.code);
  if (!data) return NextResponse.json({ error: "product_not_found" }, { status: 404 });
  return NextResponse.json({ product: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const authorization = await getCatalogAdminClient();
  if (authorization.response) return authorization.response;
  // Products have dependent variants, cart references, orders, and reviews. Archive via active=false.
  const { data, error } = await authorization.client.from("products").update({ active: false }).eq("id", id)
    .select("id, active").maybeSingle();
  if (error) return mapCatalogWriteError(error.code);
  if (!data) return NextResponse.json({ error: "product_not_found" }, { status: 404 });
  return NextResponse.json({ product: data });
}
