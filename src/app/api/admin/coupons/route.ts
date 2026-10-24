import { NextResponse } from "next/server";
import { getActiveAdminClient, mapCommerceWriteError } from "@/lib/commerce/admin";
import { parseCouponInput } from "@/lib/coupons/coupons";

export async function GET() {
  const authorization = await getActiveAdminClient();
  if (authorization.response) return authorization.response;
  const { data, error } = await authorization.client.from("coupons")
    .select("id, code, discount_percent, starts_at, ends_at, minimum_order_cents, usage_limit, usage_count, active")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "coupon_settings_unavailable" }, { status: 503 });
  return NextResponse.json({ coupons: data ?? [] });
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const input = parseCouponInput(body);
  if (!input) return NextResponse.json({ error: "validation_failed" }, { status: 400 });

  const authorization = await getActiveAdminClient();
  if (authorization.response) return authorization.response;
  const { data, error } = await authorization.client.from("coupons").insert(input)
    .select("id, code, discount_percent, starts_at, ends_at, minimum_order_cents, usage_limit, usage_count, active").single();
  if (error) return mapCommerceWriteError(error.code);
  return NextResponse.json({ coupon: data }, { status: 201 });
}
