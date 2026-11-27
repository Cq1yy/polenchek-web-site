import { expect, rect, settle, test } from "./fixtures";

test("TOS page shows both sections with all rules", async ({ page }) => {
  await page.goto("/tos");
  await settle(page);
  await expect(page.getByRole("heading", { level: 2, name: "TOS" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Important" })).toBeVisible();
  await expect(page.locator("main ol > li")).toHaveCount(11);
  await expect(page.getByText("I will not accept refunds.")).toBeVisible();
});

test("TOS title sits below the nav", async ({ page }) => {
  await page.goto("/tos");
  await settle(page);
  const nav = await rect(page, "header nav");
  const title = await rect(page, "h1 img");
  expect(title.top + title.height * 0.08).toBeGreaterThan(nav.bottom - 4);
});

test("all rules become visible when scrolled", async ({ page }) => {
  await page.goto("/tos");
  await settle(page, 1200);
  const items = page.locator("main ol > li");
  const n = await items.count();
  for (let i = 0; i < n; i++) {
    await items.nth(i).scrollIntoViewIfNeeded();
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(800);
  // scroll-driven reveal must end fully opaque once an item is well inside the viewport
  const last = items.last();
  await last.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(500);
  expect(Number(await last.evaluate((el) => getComputedStyle(el).opacity))).toBeGreaterThan(0.95);
});

test("call-to-action buttons lead to prices and gallery", async ({ page }) => {
  await page.goto("/tos");
  await settle(page, 1200);
  await page.getByRole("link", { name: "See prices" }).click();
  await expect(page).toHaveURL(/\/price$/);
  await page.goto("/tos");
  await settle(page, 1200);
  await page.locator("main").getByRole("link", { name: "Gallery" }).click();
  await expect(page).toHaveURL(/\/gallery$/);
});
