import { NextResponse } from "next/server";
import { getActiveAdminClient, mapCommerceWriteError } from "@/lib/commerce/admin";
import { parseCouponInput } from "@/lib/coupons/coupons";

type RouteContext = { params: Promise<{ id: string }> };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "coupon_not_found" }, { status: 404 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const input = parseCouponInput(body);
  if (!input) return NextResponse.json({ error: "validation_failed" }, { status: 400 });

  const authorization = await getActiveAdminClient();
  if (authorization.response) return authorization.response;
  const { data, error } = await authorization.client.from("coupons").update(input).eq("id", id)
    .select("id, code, discount_percent, starts_at, ends_at, minimum_order_cents, usage_limit, usage_count, active").maybeSingle();
  if (error) return mapCommerceWriteError(error.code);
  if (!data) return NextResponse.json({ error: "coupon_not_found" }, { status: 404 });
  return NextResponse.json({ coupon: data });
}
