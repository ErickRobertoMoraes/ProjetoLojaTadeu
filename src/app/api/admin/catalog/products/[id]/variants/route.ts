import { NextResponse } from "next/server";
import { getCatalogAdminClient, mapCatalogWriteError } from "@/lib/catalog/admin";
import { parseCatalogVariant } from "@/lib/catalog/catalog";

type RouteContext = { params: Promise<{ id: string }> };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request, context: RouteContext) {
  const { id: productId } = await context.params;
  if (!UUID_PATTERN.test(productId)) return NextResponse.json({ error: "product_not_found" }, { status: 404 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const input = parseCatalogVariant(body);
  if (!input) return NextResponse.json({ error: "validation_failed" }, { status: 400 });

  const authorization = await getCatalogAdminClient();
  if (authorization.response) return authorization.response;
  const { data, error } = await authorization.client.from("product_variants")
    .insert({ ...input, product_id: productId })
    .select("id, product_id, sku, attributes, price_cents, stock, active").single();
  if (error) return mapCatalogWriteError(error.code);
  return NextResponse.json({ variant: data }, { status: 201 });
}
