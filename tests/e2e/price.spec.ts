import { expect, isDeskPrice, settle, test } from "./fixtures";

test("price list fits one screen (no page scroll, nothing cut off)", async ({ page }) => {
  await page.goto("/price");
  await settle(page);
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(1);

  if (isDeskPrice(page)) {
    const r = await page.evaluate(() => {
      const board = document.querySelector(".price-board") as HTMLElement;
      const items = [...board.querySelectorAll("li")].map((li) => li.getBoundingClientRect());
      return { overflow: board.scrollHeight - board.clientHeight, items: items.length, maxBottom: Math.max(...items.map((i) => i.bottom)), vh: innerHeight };
    });
    expect(r.items).toBe(10);
    expect(r.overflow).toBeLessThanOrEqual(1);
    expect(r.maxBottom).toBeLessThan(r.vh);
  }
});

test("desktop board fits at small laptop sizes too", async ({ page }) => {
  test.skip(!isDeskPrice(page), "desktop board");
  await page.goto("/price");
  await settle(page, 1500);
  for (const [w, h] of [
    [1024, 600],
    [1280, 650],
    [1366, 768],
    [1920, 1080],
    [2560, 1440],
  ]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const board = document.querySelector(".price-board") as HTMLElement;
      return { overflow: board.scrollHeight - board.clientHeight, scroll: document.documentElement.scrollHeight - innerHeight };
    });
    expect.soft(r.overflow, `${w}x${h} board overflow`).toBeLessThanOrEqual(1);
    expect.soft(r.scroll, `${w}x${h} page scroll`).toBeLessThanOrEqual(1);
  }
});

test("mobile tabs: every category fits and switches", async ({ page }) => {
  test.skip(isDeskPrice(page), "mobile tabs");
  await page.goto("/price");
  await settle(page);
  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(4);
  for (const name of ["Headshot", "Halfbody", "Fullbody", "Special"]) {
    await page.getByRole("tab", { name }).click();
    await expect(page.getByRole("tab", { name })).toHaveAttribute("aria-selected", "true");
    await page.waitForTimeout(700);
    const visibleHeading = await page.locator("h2").evaluateAll((hs) => hs.filter((h) => (h as HTMLElement).offsetParent).map((h) => h.textContent));
    expect(visibleHeading).toContain(name);
    const overflow = await page.locator("[data-price-panel]").evaluate((el) => el.scrollHeight - el.clientHeight);
    expect.soft(overflow, `${name} fits without inner scrolling`).toBeLessThanOrEqual(2);
  }
});

test("mobile tabs: swipe left/right changes category", async ({ page }) => {
  test.skip(isDeskPrice(page), "mobile tabs");
  await page.goto("/price");
  await settle(page);
  const area = await page.locator("[data-price-panel]").boundingBox();
  const y = area!.y + area!.height * 0.7;
  await page.mouse.move(area!.x + area!.width * 0.85, y);
  await page.mouse.down();
  await page.mouse.move(area!.x + area!.width * 0.15, y, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByRole("tab", { name: "Halfbody" })).toHaveAttribute("aria-selected", "true");
});

test("'Examples →' opens the matching gallery section", async ({ page }) => {
  await page.goto("/price");
  await settle(page);
  if (!isDeskPrice(page)) await page.getByRole("tab", { name: "Fullbody" }).click();
  await page.locator('a[href="/gallery#fullbody"]').filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/\/gallery#fullbody$/);
  await page.waitForTimeout(2200);
  const top = await page.locator("#fullbody").evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeGreaterThan(-10);
  expect(top).toBeLessThan(260);
});

test("link to the terms of service", async ({ page }) => {
  await page.goto("/price");
  await settle(page, 1500);
  await page.locator('main a[href="/tos"]').filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/\/tos$/);
});
