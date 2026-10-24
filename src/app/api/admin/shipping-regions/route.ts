import { NextResponse } from "next/server";
import { getActiveAdminClient } from "@/lib/commerce/admin";
import { SHIPPING_REGIONS, type ShippingRegionCode } from "@/lib/shipping/shipping";

export async function GET() {
  const authorization = await getActiveAdminClient();
  if (authorization.response) return authorization.response;

  const { data, error } = await authorization.client.from("shipping_regions")
    .select("id, code, name, price_cents, delivery_days, active").order("code");
  if (error) return NextResponse.json({ error: "shipping_settings_unavailable" }, { status: 503 });

  const configured = new Map((data ?? []).map((region) => [region.code, region]));
  return NextResponse.json({ regions: SHIPPING_REGIONS.map((region) => ({
    ...region,
    ...(configured.get(region.code as ShippingRegionCode) ?? { id: null, price_cents: null, delivery_days: null, active: false }),
  })) });
}
