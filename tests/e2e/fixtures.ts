import { test as base, expect, type Page } from "@playwright/test";

/** Fail on console errors and uncaught exceptions. */
export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
      });
      page.on("pageerror", (err) => {
        errors.push(`pageerror: ${err.message}`);
      });
      await use(errors);
      expect(errors, "no console errors / uncaught exceptions").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1200) < 768;
export const isDeskPrice = (page: Page) => (page.viewportSize()?.width ?? 1200) >= 1024;

/** Wait until entrance animations have finished. */
export async function settle(page: Page, ms = 2200) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(ms);
}

/**
 * Next 16 keeps previously visited pages mounted but hidden (React <Activity>),
 * so always target the visible instance.
 */
export const visible = (page: Page, selector: string) => page.locator(selector).filter({ visible: true });

export async function rect(page: Page, selector: string) {
  return visible(page, selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
  });
}
