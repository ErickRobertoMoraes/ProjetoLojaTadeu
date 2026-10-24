import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateShippingQuote, isShippingRegionCode } from "@/lib/shipping/shipping";

export async function GET(request: Request) {
  const regionCode = new URL(request.url).searchParams.get("region");
  if (!isShippingRegionCode(regionCode)) {
    return NextResponse.json({ error: "invalid_shipping_region" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("shipping_regions")
      .select("code, name, price_cents, delivery_days, active").eq("code", regionCode).eq("active", true).maybeSingle();
    if (error) return NextResponse.json({ error: "shipping_quote_unavailable" }, { status: 503 });
    if (!data) return NextResponse.json({ error: "shipping_region_unconfigured" }, { status: 404 });

    const quote = calculateShippingQuote(regionCode, [data]);
    if (!quote) return NextResponse.json({ error: "shipping_region_unconfigured" }, { status: 404 });
    return NextResponse.json({ quote });
  } catch {
    return NextResponse.json({ error: "shipping_quote_unavailable" }, { status: 503 });
  }
}
