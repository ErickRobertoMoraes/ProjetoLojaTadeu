import { NextResponse } from "next/server";
import { getCatalogAdminClient, mapCatalogWriteError } from "@/lib/catalog/admin";

type RouteContext = { params: Promise<{ id: string }> };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IMAGE_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request, context: RouteContext) {
  const { id: productId } = await context.params;
  if (!UUID_PATTERN.test(productId)) return NextResponse.json({ error: "product_not_found" }, { status: 404 });

  const authorization = await getCatalogAdminClient();
  if (authorization.response) return authorization.response;
  let form: FormData;
  try { form = await request.formData(); } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const file = form.get("file");
  const altText = form.get("alt_text");
  if (!(file instanceof File) || typeof altText !== "string" || !altText.trim() || altText.trim().length > 240) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }
  const extension = IMAGE_TYPES[file.type as keyof typeof IMAGE_TYPES];
  if (!extension || file.size < 1 || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "image_file_invalid" }, { status: 400 });
  }

  const { data: lastImage, error: listError } = await authorization.client.from("product_images")
    .select("sort_order").eq("product_id", productId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  if (listError) return NextResponse.json({ error: "catalog_unavailable" }, { status: 503 });

  const storagePath = `${productId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await authorization.client.storage.from("product-images")
    .upload(storagePath, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (uploadError) return NextResponse.json({ error: "image_upload_failed" }, { status: 503 });

  const { data, error } = await authorization.client.from("product_images").insert({
    product_id: productId,
    storage_path: storagePath,
    alt_text: altText.trim(),
    sort_order: (lastImage?.sort_order ?? -1) + 1,
  }).select("id, product_id, storage_path, sort_order, alt_text").single();
  if (error) {
    await authorization.client.storage.from("product-images").remove([storagePath]);
    return mapCatalogWriteError(error.code);
  }
  const { data: urlData } = authorization.client.storage.from("product-images").getPublicUrl(storagePath);
  return NextResponse.json({ image: { ...data, url: urlData.publicUrl } }, { status: 201 });
}
