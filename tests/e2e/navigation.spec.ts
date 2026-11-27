import { expect, isMobile, settle, test, visible } from "./fixtures";

test("nav bar: every link navigates and marks itself active", async ({ page }) => {
  await page.goto("/");
  await settle(page, 1200);
  for (const [href, label] of [
    ["/gallery", "Gallery"],
    ["/price", "Price"],
    ["/tos", "TOS"],
    ["/", "Home"],
  ] as const) {
    await page.locator(`header nav a[href="${href}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${href === "/" ? "/$" : href}`));
    await expect(page.locator('header nav [aria-current="page"]')).toHaveText(label);
  }
});

test("home buttons follow the Gallery, Price, TOS order and open each page", async ({ page }) => {
  for (const href of ["/gallery", "/price", "/tos"]) {
    await page.goto("/");
    await expect(page.locator('main a[href^="/"]')).toHaveText(["Gallery", "Price", "TOS"]);
    await settle(page, 1800);
    await page.locator(`main a[href="${href}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(href));
    await expect(visible(page, "h1")).toHaveCount(1);
  }
});

test("rapid navigation does not break anything", async ({ page }) => {
  await page.goto("/");
  await settle(page, 1200);
  for (const href of ["/price", "/gallery", "/tos", "/", "/gallery", "/price", "/tos"]) {
    await page.locator(`header nav a[href="${href}"]`).click();
  }
  await expect(page).toHaveURL(/\/tos$/);
  await settle(page, 1500);
  await expect(page.locator('header nav [aria-current="page"]')).toHaveText("TOS");
  await expect(visible(page, "h1")).toHaveCount(1);
});

test("browser back restores the scroll position", async ({ page }) => {
  test.skip(isMobile(page), "desktop scroll restoration check");
  await page.goto("/gallery");
  await settle(page, 1500);
  await page.mouse.move(700, 500);
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1200);
  const before = await page.evaluate(() => Math.round(scrollY));
  expect(before).toBeGreaterThan(800);

  await page.locator('header nav a[href="/price"]').click();
  await expect(page).toHaveURL(/\/price$/);
  await settle(page, 800);
  await page.goBack();
  await expect(page).toHaveURL(/\/gallery$/);
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => Math.round(scrollY));
  expect(Math.abs(after - before)).toBeLessThan(60);
});

test("wheel scrolling works right after coming from a non-scrolling page", async ({ page }) => {
  test.skip(isMobile(page), "mouse wheel");
  await page.goto("/price");
  await settle(page, 1200);
  await page.locator('header nav a[href="/gallery"]').click();
  await expect(page).toHaveURL(/\/gallery$/);
  await page.waitForTimeout(1200);
  await page.mouse.move(700, 500);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(500);
});
