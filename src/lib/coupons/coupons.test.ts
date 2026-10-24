import { describe, expect, it } from "vitest";
import { parseCouponInput, quoteCoupon, type CouponRecord } from "./coupons";

const validCoupon: CouponRecord = {
  code: "FIT10",
  discount_percent: 10,
  starts_at: "2026-01-01T00:00:00.000Z",
  ends_at: "2027-01-01T00:00:00.000Z",
  minimum_order_cents: 1000,
  usage_limit: 5,
  usage_count: 1,
  active: true,
};

describe("coupon input and quote", () => {
  it("normalizes coupon code and returns UTC timestamps", () => {
    expect(parseCouponInput({
      code: " fit10 ", discount_percent: 10, starts_at: "2026-01-01T00:00:00-03:00",
      ends_at: "2027-01-01T00:00:00-03:00", minimum_order_cents: 1000, usage_limit: 5, active: true,
    })).toEqual({
      code: "FIT10", discount_percent: 10, starts_at: "2026-01-01T03:00:00.000Z",
      ends_at: "2027-01-01T03:00:00.000Z", minimum_order_cents: 1000, usage_limit: 5, active: true,
    });
  });

  it.each([
    [{ ...validCoupon, code: "bad code" }],
    [{ ...validCoupon, discount_percent: 0 }],
    [{ ...validCoupon, discount_percent: 100.001 }],
    [{ ...validCoupon, starts_at: "invalid" }],
    [{ ...validCoupon, ends_at: validCoupon.starts_at }],
    [{ ...validCoupon, minimum_order_cents: -1 }],
    [{ ...validCoupon, usage_limit: 0 }],
    [{ ...validCoupon, active: "yes" }],
  ])("rejects invalid coupon data %j", (input) => {
    expect(parseCouponInput(input)).toBeNull();
  });

  it("accepts the start instant and excludes the end instant", () => {
    expect(quoteCoupon(validCoupon, 1000, new Date(validCoupon.starts_at))).toEqual({ valid: true, discount_cents: 100 });
    expect(quoteCoupon(validCoupon, 1000, new Date(validCoupon.ends_at))).toEqual({ valid: false, reason: "expired" });
  });

  it("rejects an inactive, not-yet-valid, under-minimum, or exhausted coupon", () => {
    expect(quoteCoupon({ ...validCoupon, active: false }, 1000)).toEqual({ valid: false, reason: "invalid_coupon" });
    expect(quoteCoupon(validCoupon, 1000, new Date("2025-12-31T23:59:59.999Z")))
      .toEqual({ valid: false, reason: "not_started" });
    expect(quoteCoupon(validCoupon, 999)).toEqual({ valid: false, reason: "minimum_not_met" });
    expect(quoteCoupon({ ...validCoupon, usage_count: 5 }, 1000))
      .toEqual({ valid: false, reason: "usage_exhausted" });
  });

  it("rounds percentage discounts to the nearest cent and caps them at subtotal", () => {
    expect(quoteCoupon({ ...validCoupon, discount_percent: 12.5 }, 1001))
      .toEqual({ valid: true, discount_cents: 125 });
    expect(quoteCoupon({ ...validCoupon, discount_percent: 100 }, 1000))
      .toEqual({ valid: true, discount_cents: 1000 });
  });
});
