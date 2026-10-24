import { NextResponse } from "next/server";
import { getActiveAdminClient, mapCommerceWriteError } from "@/lib/commerce/admin";
import { isShippingRegionCode, parseShippingRate, SHIPPING_REGIONS } from "@/lib/shipping/shipping";

type RouteContext = { params: Promise<{ code: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { code } = await context.params;
  if (!isShippingRegionCode(code)) return NextResponse.json({ error: "shipping_region_not_found" }, { status: 404 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const input = parseShippingRate(body);
  if (!input) return NextResponse.json({ error: "validation_failed" }, { status: 400 });

  const authorization = await getActiveAdminClient();
  if (authorization.response) return authorization.response;
  const region = SHIPPING_REGIONS.find((item) => item.code === code)!;
  const { data, error } = await authorization.client.from("shipping_regions").upsert({
    code,
    name: region.name,
    ...input,
    active: true,
  }, { onConflict: "code" }).select("id, code, name, price_cents, delivery_days, active").single();
  if (error) return mapCommerceWriteError(error.code);
  return NextResponse.json({ region: data });
}
