import { expect, settle, test } from "./fixtures";

const PAGES = [
  { path: "/", title: /Polenchek/ },
  { path: "/gallery", title: /Gallery/ },
  { path: "/price", title: /Price/ },
  { path: "/tos", title: /Terms of Service/ },
];

for (const p of PAGES) {
  test.describe(`page ${p.path}`, () => {
    test("loads, has one h1, accessible images, no horizontal overflow", async ({ page }) => {
      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(p.title);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.locator("h1")).toHaveCount(1);
      await settle(page);

      // every <img> declares alt (decorative ones use alt="")
      const missingAlt = await page.locator("img:not([alt])").count();
      expect(missingAlt).toBe(0);

      // every button / link has an accessible name
      const unnamed = await page.evaluate(() =>
        [...document.querySelectorAll("a, button")]
          .filter((el) => (el as HTMLElement).offsetParent !== null)
          .filter((el) => !(el.textContent?.trim() || el.getAttribute("aria-label")))
          .map((el) => el.outerHTML.slice(0, 80)),
      );
      expect(unnamed).toEqual([]);

      const overflowX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflowX).toBeLessThanOrEqual(1);
    });

    test("images above the fold load", async ({ page }) => {
      await page.goto(p.path);
      await settle(page, 1500);
      const broken = await page.evaluate(() =>
        [...document.images]
          .filter((img) => {
            const r = img.getBoundingClientRect();
            return r.bottom > 0 && r.top < innerHeight && r.width > 0 && getComputedStyle(img).visibility !== "hidden";
          })
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.currentSrc || img.src),
      );
      expect(broken).toEqual([]);
    });
  });
}

test("404 page", async ({ page, errors }) => {
  const res = await page.goto("/this-page-does-not-exist");
  expect(res?.status()).toBe(404);
  // the browser logs the 404 document itself — expected here
  const expected = (e: string) => /status of 404/.test(e);
  errors.splice(0, errors.length, ...errors.filter((e) => !expected(e)));
  await expect(page.getByText("404")).toBeVisible();
  await page.getByRole("link", { name: /back home/i }).click();
  await expect(page).toHaveURL(/\/$/);
  errors.splice(0, errors.length, ...errors.filter((e) => !expected(e)));
});
