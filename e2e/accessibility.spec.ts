import { expect, test } from "@playwright/test";

const principalPages = ["/", "/entrar", "/cadastro", "/produtos"];
const visibleControls = "a:visible, button:visible, input:visible, select:visible, textarea:visible";

test("principal pages have named controls, keyboard focus and responsive layouts", async ({ page }) => {
  for (const path of principalPages) {
    await page.goto(path);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");

    for (const control of await page.locator(visibleControls).all()) {
      await expect(control).toHaveAccessibleName(/.+/);
    }

    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${path} at ${width}px`).toBe(true);
    }
  }

  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveCount(1);
  await expect(page.locator(":focus")).toHaveAccessibleName(/.+/);
});
