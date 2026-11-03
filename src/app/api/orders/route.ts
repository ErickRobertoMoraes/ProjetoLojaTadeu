import { NextResponse } from "next/server";
import { requireConfirmedEmailForCheckout } from "@/lib/identity/authorization";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paymentMethods = new Set(["pix", "card", "boleto"]);
const domainErrors: Record<string, number> = {
  address_required: 422,
  cart_empty: 422,
  cart_item_unavailable: 409,
  invalid_coupon: 422,
  not_started: 422,
  expired: 422,
  minimum_not_met: 422,
  usage_exhausted: 422,
  shipping_region_unconfigured: 422,
  checkout_forbidden: 403,
  unauthenticated: 401,
  invalid_payment_method: 400,
  cart_total_invalid: 409,
};

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const authorization = await requireConfirmedEmailForCheckout(supabase.auth);
    if (!authorization.allowed) {
      return NextResponse.json({ error: authorization.reason }, { status: authorization.reason === "unauthenticated" ? 401 : 403 });
    }

    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "validation_failed" }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "validation_failed" }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    if (typeof input.payment_method !== "string" || !paymentMethods.has(input.payment_method) ||
      (input.coupon_code !== undefined && input.coupon_code !== null &&
        (typeof input.coupon_code !== "string" || input.coupon_code.trim().length > 40))) {
      return NextResponse.json({ error: "validation_failed" }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("create_simulated_order", {
      p_payment_method: input.payment_method,
      p_coupon_code: typeof input.coupon_code === "string" ? input.coupon_code.trim() || null : null,
    });
    if (error) {
      const code = error.message;
      const status = domainErrors[code] ?? (error.code === "42501" ? 403 : 503);
      return NextResponse.json({ error: domainErrors[code] ? code : status === 503 ? "order_unavailable" : "checkout_forbidden" }, { status });
    }
    return NextResponse.json({ order: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "order_unavailable" }, { status: 503 });
  }
}
