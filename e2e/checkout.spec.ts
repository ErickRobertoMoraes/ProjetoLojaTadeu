import { expect, test } from "@playwright/test";

const quote = {
  items: [{ sku: "CAMISETA-M", name: "Camiseta FitStore", attributes: { tamanho: "M" }, quantity: 2,
    unit_price_cents: 2500, line_total_cents: 5000 }],
  address: { postal_code: "01001-000", city: "São Paulo", state: "SP" },
  subtotal_cents: 5000,
  coupon: null,
  discount_cents: 0,
  shipping: { name: "São Paulo", price_cents: 799, delivery_days: 3 },
  total_cents: 5799,
};

test("shows item subtotal, configured shipping and the recalculated total", async ({ page }) => {
  await page.route("**/api/checkout/quote", async (route) => {
    await route.fulfill({ status: 200, json: { quote } });
  });

  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Resumo do pedido" })).toBeVisible();
  await expect(page.getByText("Camiseta FitStore · 2 × R$ 25,00 — R$ 50,00")).toBeVisible();
  await expect(page.getByText(/Subtotal:.*50,00/)).toBeVisible();
  await expect(page.getByText(/Frete \(São Paulo, 3 dias\):.*7,99/)).toBeVisible();
  await expect(page.getByText(/Total cotado:.*57,99/)).toBeVisible();
  await expect(page.getByRole("note")).toContainText("ainda não foi confirmada");
});

test("shows the confirmation requirement returned by the checkout API", async ({ page }) => {
  await page.route("**/api/checkout/quote", async (route) => {
    await route.fulfill({ status: 403, json: { error: "email_unconfirmed" } });
  });

  await page.goto("/checkout");
  await expect(page.locator('p[role="alert"]')).toHaveText("Confirme seu e-mail antes de avançar para o checkout.");
  await expect(page.getByRole("heading", { name: "Resumo do pedido" })).toHaveCount(0);
});

test("re-applies a coupon and displays the updated discount and total", async ({ page }) => {
  await page.route("**/api/checkout/quote", async (route) => {
    const body = route.request().postDataJSON() as { coupon_code?: string };
    await route.fulfill({ status: 200, json: { quote: body.coupon_code === "FIT10"
      ? { ...quote, coupon: { code: "FIT10", discount_percent: 10 }, discount_cents: 500, total_cents: 5299 }
      : quote } });
  });

  await page.goto("/checkout");
  const coupon = page.getByLabel("Cupom (opcional)");
  await coupon.fill("FIT10");
  await page.getByRole("button", { name: "Atualizar cotação" }).click();
  await expect(page.getByText(/Cupom FIT10:.*5,00/)).toBeVisible();
  await expect(page.getByText(/Total cotado:.*52,99/)).toBeVisible();
});
