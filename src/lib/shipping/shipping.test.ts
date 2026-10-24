import { describe, expect, it } from "vitest";
import { calculateShippingQuote, parseShippingRate, SHIPPING_REGIONS, type ShippingRate } from "./shipping";

const rates: ShippingRate[] = SHIPPING_REGIONS.map((region, index) => ({
  ...region,
  price_cents: 1200 + index * 100,
  delivery_days: index + 2,
  active: true,
}));

describe("regional shipping", () => {
  it("returns configured price and delivery time for all four regions", () => {
    for (const [index, region] of SHIPPING_REGIONS.entries()) {
      expect(calculateShippingQuote(region.code, rates)).toEqual({
        code: region.code,
        name: region.name,
        price_cents: 1200 + index * 100,
        delivery_days: index + 2,
      });
    }
  });

  it("does not quote an invalid, missing, or inactive region", () => {
    expect(calculateShippingQuote("unknown", rates)).toBeNull();
    expect(calculateShippingQuote("sp", [])).toBeNull();
    expect(calculateShippingQuote("sp", [{ ...rates[0], active: false }])).toBeNull();
  });

  it.each([
    [{ price_cents: -1, delivery_days: 2 }],
    [{ price_cents: 0, delivery_days: 0 }],
    [{ price_cents: 1.5, delivery_days: 2 }],
    [{ price_cents: 2, delivery_days: 1.5 }],
    [null],
  ])("rejects invalid shipping rate input %j", (input) => {
    expect(parseShippingRate(input)).toBeNull();
  });

  it("accepts free shipping and a positive integer delivery time", () => {
    expect(parseShippingRate({ price_cents: 0, delivery_days: 1 })).toEqual({
      price_cents: 0,
      delivery_days: 1,
    });
  });
});
