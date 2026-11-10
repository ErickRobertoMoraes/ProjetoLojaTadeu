import { expect, test } from "@playwright/test";

test("redirects unauthenticated visitors away from administrative operations", async ({ page }) => {
  await page.goto("/admin/operacao");
  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});
