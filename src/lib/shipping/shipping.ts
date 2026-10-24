export const SHIPPING_REGIONS = [
  { code: "sp", name: "São Paulo" },
  { code: "southeast", name: "Demais Sudeste" },
  { code: "south_center_west", name: "Sul e Centro-Oeste" },
  { code: "north_northeast", name: "Norte e Nordeste" },
] as const;

export type ShippingRegionCode = (typeof SHIPPING_REGIONS)[number]["code"];
export type ShippingRate = {
  code: ShippingRegionCode;
  name: string;
  price_cents: number;
  delivery_days: number;
  active: boolean;
};

const POSTGRES_INTEGER_MAX = 2_147_483_647;

export function isShippingRegionCode(value: unknown): value is ShippingRegionCode {
  return typeof value === "string" && SHIPPING_REGIONS.some((region) => region.code === value);
}

export function parseShippingRate(value: unknown): { price_cents: number; delivery_days: number } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (!Number.isSafeInteger(body.price_cents) || (body.price_cents as number) < 0 ||
      (body.price_cents as number) > POSTGRES_INTEGER_MAX) return null;
  if (!Number.isSafeInteger(body.delivery_days) || (body.delivery_days as number) < 1 ||
      (body.delivery_days as number) > POSTGRES_INTEGER_MAX) return null;
  return { price_cents: body.price_cents as number, delivery_days: body.delivery_days as number };
}

export function calculateShippingQuote(
  regionCode: unknown,
  rates: readonly ShippingRate[],
): { code: ShippingRegionCode; name: string; price_cents: number; delivery_days: number } | null {
  if (!isShippingRegionCode(regionCode)) return null;
  const rate = rates.find((item) => item.code === regionCode && item.active);
  if (!rate) return null;
  return {
    code: rate.code,
    name: rate.name,
    price_cents: rate.price_cents,
    delivery_days: rate.delivery_days,
  };
}
