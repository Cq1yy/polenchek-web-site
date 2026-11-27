import { expect, isMobile, settle, test } from "./fixtures";

test("section jumper scrolls to each section", async ({ page }) => {
  await page.goto("/gallery");
  await settle(page, 1500);
  for (const name of ["Fullbody", "Halfbody", "Headshot"]) {
    await page.getByRole("group", { name: "Gallery sections" }).getByRole("button", { name }).click();
    await page.waitForTimeout(1600);
    const top = await page.locator(`#${name.toLowerCase()}`).evaluate((el) => el.getBoundingClientRect().top);
    expect.soft(top, `${name} near the top`).toBeGreaterThan(-10);
    expect.soft(top, `${name} near the top`).toBeLessThan(260);
  }
});

test("all 11 artworks load when scrolled into view", async ({ page }) => {
  await page.goto("/gallery");
  await settle(page, 1000);
  const cards = page.locator('button[aria-label^="Open"]');
  await expect(cards).toHaveCount(11);
  for (let i = 0; i < 11; i++) {
    await cards.nth(i).scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
  }
  await page.waitForLoadState("networkidle");
  const broken = await page.locator('button[aria-label^="Open"] img').evaluateAll((imgs) =>
    (imgs as HTMLImageElement[]).filter((i) => !i.complete || i.naturalWidth === 0).length,
  );
  expect(broken).toBe(0);
});

test("lightbox: open, next/prev, close, scroll unlocked, focus returns", async ({ page }) => {
  await page.goto("/gallery");
  await settle(page, 1500);
  const first = page.locator('button[aria-label^="Open"]').first();
  await first.scrollIntoViewIfNeeded();
  await first.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("p")).toContainText("1 / 11");
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");

  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator("p")).toContainText("2 / 11");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.locator("p")).toContainText("11 / 11");

  if (isMobile(page)) await page.getByRole("button", { name: "Close" }).click();
  else await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
  await expect(first).toBeFocused();

  // the page can scroll again
  const y0 = await page.evaluate(() => scrollY);
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(y0);
});

test("lightbox image is centred and fully inside the screen", async ({ page }) => {
  await page.goto("/gallery");
  await settle(page, 1500);
  await page.locator('button[aria-label^="Open"]').nth(3).click();
  await page.waitForTimeout(1200);
  const r = await page.locator("[role=dialog] .cursor-grab").evaluate((el) => {
    const b = el.getBoundingClientRect();
    return { l: b.left, t: b.top, r: innerWidth - b.right, b: innerHeight - b.bottom };
  });
  for (const v of Object.values(r)) expect(v).toBeGreaterThanOrEqual(-1);
  expect(Math.abs(r.l - r.r)).toBeLessThan(4);
});

test("rapid open/close of the lightbox stays consistent", async ({ page }) => {
  await page.goto("/gallery");
  await settle(page, 1500);
  for (let i = 0; i < 4; i++) {
    await page.locator('button[aria-label^="Open"]').nth(i).click({ force: true });
    await page.waitForTimeout(150);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(1000);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const hidden = await page.locator('button[aria-label^="Open"] > div').evaluateAll((els) =>
    els.filter((el) => getComputedStyle(el).opacity !== "1" || getComputedStyle(el).visibility !== "visible").length,
  );
  expect(hidden).toBe(0);
});
