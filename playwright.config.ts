import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against the PRODUCTION build.
 *   npm run build
 *   npm run test:e2e
 * Chrome uses the locally installed Google Chrome; Safari is emulated with Playwright's WebKit.
 */
const PORT = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  workers: 3,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `node node_modules/next/dist/bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    {
      name: "chrome-desktop",
      use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1536, height: 864 } },
    },
    {
      name: "chrome-android",
      use: { ...devices["Pixel 7"], channel: "chrome" },
    },
    {
      name: "safari-desktop",
      use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "safari-iphone",
      use: { ...devices["iPhone 14"] },
    },
  ],
});
