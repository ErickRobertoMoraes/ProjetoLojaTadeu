const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_QUANTITY = 99;

export type CartChange = { variant_id: string; quantity: number };

export function parseCartChange(value: unknown): CartChange | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (typeof input.variant_id !== "string" || !UUID_PATTERN.test(input.variant_id)) return null;
  if (!Number.isSafeInteger(input.quantity) || (input.quantity as number) < 1 || (input.quantity as number) > MAX_QUANTITY) return null;
  return { variant_id: input.variant_id, quantity: input.quantity as number };
}

export function canSetCartQuantity(quantity: number, availableStock: number): boolean {
  return Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= MAX_QUANTITY &&
    Number.isSafeInteger(availableStock) && availableStock >= 0 && quantity <= availableStock;
}

export function isCartVariantAvailable(variant: {
  active: boolean;
  stock: number;
  product?: { active: boolean; category?: { active: boolean } | null } | null;
}): boolean {
  return variant.active && variant.stock > 0 && variant.product?.active === true &&
    variant.product.category?.active === true;
}
