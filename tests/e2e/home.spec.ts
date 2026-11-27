import type { Page } from "@playwright/test";

import { expect, rect, settle, test } from "./fixtures";

async function layout(page: Page) {
  const nav = await rect(page, "header nav");
  const title = await rect(page, "h1 img");
  const buttons = await page.locator("main a.lg-host[href^='/']").evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
    }),
  );
  return {
    nav,
    // the calligraphy occupies ~10%..88% of the image height (transparent margins)
    inkTop: title.top + title.height * 0.1,
    inkBottom: title.top + title.height * 0.88,
    buttons,
    scroll: await page.evaluate(() => document.documentElement.scrollHeight - innerHeight),
  };
}

test("signature stays below the nav and above the buttons; buttons don't overlap", async ({ page }) => {
  await page.goto("/");
  await settle(page);
  const l = await layout(page);
  expect(l.buttons).toHaveLength(3);
  expect(l.inkTop).toBeGreaterThan(l.nav.bottom);
  for (const b of l.buttons) expect(l.inkBottom).toBeLessThan(b.top);
  for (let i = 1; i < l.buttons.length; i++) {
    const a = l.buttons[i - 1];
    const b = l.buttons[i];
    const overlap = a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    expect(overlap).toBe(false);
  }
});

const DESKTOP_SIZES = [
  [1280, 600],
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [1536, 864],
  [1920, 1080],
  [2560, 1080],
  [2560, 1440],
  [1024, 768],
  [768, 1024],
];

test("desktop composition fits every common screen without scrolling", async ({ page }, info) => {
  test.skip(!info.project.name.includes("desktop"), "desktop-only matrix");
  await page.goto("/");
  await settle(page);
  for (const [w, h] of DESKTOP_SIZES) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(400);
    const l = await layout(page);
    expect.soft(l.inkTop, `${w}x${h}: signature below nav`).toBeGreaterThan(l.nav.bottom);
    expect.soft(l.inkBottom, `${w}x${h}: signature above buttons`).toBeLessThan(Math.min(...l.buttons.map((b) => b.top)));
    expect.soft(l.scroll, `${w}x${h}: no page scroll`).toBeLessThanOrEqual(2);
  }
});

test("liquid glass: refraction on desktop Chrome, frosted fallback elsewhere", async ({ page }, info) => {
  await page.goto("/");
  await settle(page, 1500);
  const s = await page.evaluate(() => {
    const b = document.querySelector(".lg-backdrop") as HTMLElement;
    return {
      refracting: document.querySelectorAll('.lg-backdrop[style*="url("]').length,
      filters: document.querySelectorAll("filter feDisplacementMap").length,
      backdrop: getComputedStyle(b).backdropFilter || (getComputedStyle(b) as unknown as Record<string, string>).webkitBackdropFilter,
    };
  });
  if (info.project.name === "chrome-desktop") {
    expect(s.refracting).toBeGreaterThan(0);
    expect(s.filters).toBe(s.refracting);
  } else {
    expect(s.refracting).toBe(0);
    expect(s.backdrop).toContain("blur");
  }
});

test("reduced motion: entrance animations are disabled and the page still works", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const names = await page.locator(".anim-pop, .anim-avatar, .anim-write").evaluateAll((els) =>
    els.map((el) => getComputedStyle(el).animationName),
  );
  expect(names.every((n) => n === "none")).toBe(true);
  await page.locator('main a[href="/price"]').click();
  await expect(page).toHaveURL(/\/price$/);
});
