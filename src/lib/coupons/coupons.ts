const POSTGRES_INTEGER_MAX = 2_147_483_647;

export type CouponInput = {
  code: string;
  discount_percent: number;
  starts_at: string;
  ends_at: string;
  minimum_order_cents: number;
  usage_limit: number;
  active: boolean;
};

export type CouponRecord = CouponInput & { usage_count: number };

export type CouponQuote =
  | { valid: true; discount_cents: number }
  | { valid: false; reason: "invalid_coupon" | "not_started" | "expired" | "minimum_not_met" | "usage_exhausted" };

export function parseCouponInput(value: unknown): CouponInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const startsAt = typeof body.starts_at === "string" ? body.starts_at : "";
  const endsAt = typeof body.ends_at === "string" ? body.ends_at : "";
  const percent = typeof body.discount_percent === "number" ? body.discount_percent : Number.NaN;
  const startsMillis = Date.parse(startsAt);
  const endsMillis = Date.parse(endsAt);
  const minimum = body.minimum_order_cents;
  const usageLimit = body.usage_limit;

  if (!/^[A-Z0-9][A-Z0-9_-]{1,39}$/.test(code)) return null;
  if (!Number.isFinite(percent) || percent <= 0 || percent > 100 || Math.round(percent * 100) !== percent * 100) return null;
  if (!Number.isFinite(startsMillis) || !Number.isFinite(endsMillis) || endsMillis <= startsMillis) return null;
  if (!Number.isSafeInteger(minimum) || (minimum as number) < 0 || (minimum as number) > POSTGRES_INTEGER_MAX) return null;
  if (!Number.isSafeInteger(usageLimit) || (usageLimit as number) < 1 || (usageLimit as number) > POSTGRES_INTEGER_MAX) return null;
  if (typeof body.active !== "boolean") return null;

  return {
    code,
    discount_percent: percent,
    starts_at: new Date(startsMillis).toISOString(),
    ends_at: new Date(endsMillis).toISOString(),
    minimum_order_cents: minimum as number,
    usage_limit: usageLimit as number,
    active: body.active,
  };
}

export function quoteCoupon(coupon: CouponRecord, subtotalCents: number, now: Date = new Date()): CouponQuote {
  if (!coupon.active || !Number.isSafeInteger(subtotalCents) || subtotalCents < 0 ||
      coupon.usage_count < 0 || coupon.usage_count >= coupon.usage_limit) {
    return { valid: false, reason: coupon.usage_count >= coupon.usage_limit ? "usage_exhausted" : "invalid_coupon" };
  }

  const nowMillis = now.getTime();
  const startsMillis = Date.parse(coupon.starts_at);
  const endsMillis = Date.parse(coupon.ends_at);
  if (!Number.isFinite(nowMillis) || !Number.isFinite(startsMillis) || !Number.isFinite(endsMillis)) {
    return { valid: false, reason: "invalid_coupon" };
  }
  if (nowMillis < startsMillis) return { valid: false, reason: "not_started" };
  if (nowMillis >= endsMillis) return { valid: false, reason: "expired" };
  if (subtotalCents < coupon.minimum_order_cents) return { valid: false, reason: "minimum_not_met" };

  const discountCents = Math.min(Math.round((subtotalCents * coupon.discount_percent) / 100), subtotalCents);
  return { valid: true, discount_cents: discountCents };
}
