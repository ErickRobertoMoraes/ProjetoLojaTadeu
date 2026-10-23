import { NextResponse } from "next/server";
import { getCatalogAdminClient, mapCatalogWriteError } from "@/lib/catalog/admin";
import { parseCatalogCategory } from "@/lib/catalog/catalog";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const input = parseCatalogCategory(body);
  if (!input) return NextResponse.json({ error: "validation_failed" }, { status: 400 });

  const { id } = await context.params;
  const authorization = await getCatalogAdminClient();
  if (authorization.response) return authorization.response;
  const { data, error } = await authorization.client.from("categories").update(input).eq("id", id)
    .select("id, name, slug, active").maybeSingle();
  if (error) return mapCatalogWriteError(error.code);
  if (!data) return NextResponse.json({ error: "category_not_found" }, { status: 404 });
  return NextResponse.json({ category: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const authorization = await getCatalogAdminClient();
  if (authorization.response) return authorization.response;

  const { count, error: referenceError } = await authorization.client.from("products")
    .select("id", { count: "exact", head: true }).eq("category_id", id);
  if (referenceError) return NextResponse.json({ error: "catalog_unavailable" }, { status: 503 });
  if ((count ?? 0) > 0) return NextResponse.json({ error: "category_in_use" }, { status: 409 });

  const { data, error } = await authorization.client.from("categories").delete().eq("id", id)
    .select("id").maybeSingle();
  if (error) return mapCatalogWriteError(error.code);
  if (!data) return NextResponse.json({ error: "category_not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
