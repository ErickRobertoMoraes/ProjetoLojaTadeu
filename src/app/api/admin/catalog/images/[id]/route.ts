import { NextResponse } from "next/server";
import { getCatalogAdminClient, mapCatalogWriteError } from "@/lib/catalog/admin";
import { parseProductImageAltText } from "@/lib/catalog/catalog";

type RouteContext = { params: Promise<{ id: string }> };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "image_not_found" }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const altText = parseProductImageAltText(body);
  if (!altText) return NextResponse.json({ error: "validation_failed" }, { status: 400 });

  const authorization = await getCatalogAdminClient();
  if (authorization.response) return authorization.response;
  const { data, error } = await authorization.client.from("product_images").update({ alt_text: altText })
    .eq("id", id).select("id, product_id, storage_path, sort_order, alt_text").maybeSingle();
  if (error) return mapCatalogWriteError(error.code);
  if (!data) return NextResponse.json({ error: "image_not_found" }, { status: 404 });
  const { data: urlData } = authorization.client.storage.from("product-images").getPublicUrl(data.storage_path);
  return NextResponse.json({ image: { ...data, url: urlData.publicUrl } });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "image_not_found" }, { status: 404 });
  const authorization = await getCatalogAdminClient();
  if (authorization.response) return authorization.response;
  const { data: image, error: readError } = await authorization.client.from("product_images")
    .select("id, product_id, storage_path, sort_order, alt_text").eq("id", id).maybeSingle();
  if (readError) return NextResponse.json({ error: "catalog_unavailable" }, { status: 503 });
  if (!image) return NextResponse.json({ error: "image_not_found" }, { status: 404 });

  const { error: deleteError } = await authorization.client.from("product_images").delete().eq("id", id);
  if (deleteError) return mapCatalogWriteError(deleteError.code);
  const { error: storageError } = await authorization.client.storage.from("product-images").remove([image.storage_path]);
  if (storageError) {
    const { error: restoreError } = await authorization.client.from("product_images").insert(image);
    return NextResponse.json({ error: restoreError ? "image_restore_failed" : "image_delete_failed" }, { status: 503 });
  }
  return NextResponse.json({ deleted: true });
}
