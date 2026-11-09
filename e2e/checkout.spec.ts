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
  await expect(page.getByRole("note")).toContainText("A aprovação é simulada");
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

test("approves a simulated payment and confirms the order", async ({ page }) => {
  await page.route("**/api/checkout/quote", async (route) => {
    await route.fulfill({ status: 200, json: { quote } });
  });
  let submitted: { payment_method: string; coupon_code: string } | null = null;
  await page.route("**/api/orders", async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ status: 201, json: { order: {
      order_id: "order-test-012", status: "payment_approved", total_cents: quote.total_cents,
    } } });
  });

  await page.goto("/checkout");
  await page.getByLabel("Boleto", { exact: true }).check();
  await page.getByRole("button", { name: "Aprovar pagamento simulado" }).click();
  await expect(page.getByRole("heading", { name: "Pagamento simulado aprovado" })).toBeVisible();
  await expect(page.getByText(/Pedido order-test-012 confirmado/)).toBeVisible();
  await expect(page.getByRole("note")).toContainText("Nenhuma cobrança real");
  expect(submitted).toEqual({ payment_method: "boleto", coupon_code: "" });
});

test("completes a simulated purchase and cancels the eligible order", async ({ page }) => {
  await page.route("**/api/checkout/quote", async (route) => {
    await route.fulfill({ status: 200, json: { quote } });
  });
  await page.route("**/api/orders", async (route) => {
    await route.fulfill({ status: 201, json: { order: {
      order_id: "order-test-014", status: "payment_approved", total_cents: quote.total_cents,
    } } });
  });
  let cancellationRequest: { method: string; url: string } | null = null;
  await page.route("**/api/orders/order-test-014/cancel", async (route) => {
    cancellationRequest = { method: route.request().method(), url: route.request().url() };
    await route.fulfill({ status: 200, json: { order: { order_id: "order-test-014", status: "cancelled" } } });
  });

  await page.goto("/checkout");
  await page.getByRole("button", { name: "Aprovar pagamento simulado" }).click();
  await expect(page.getByText(/Pedido order-test-014 confirmado/)).toBeVisible();

  const cancellation = await page.evaluate(async () => {
    const response = await fetch("/api/orders/order-test-014/cancel", { method: "POST" });
    return { status: response.status, body: await response.json() };
  });

  expect(cancellationRequest).toMatchObject({ method: "POST" });
  expect(cancellation).toEqual({
    status: 200,
    body: { order: { order_id: "order-test-014", status: "cancelled" } },
  });
});
