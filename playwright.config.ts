import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "http://localhost:3102";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1, // shared SQLite demo DB — serialize the journeys
  timeout: 120_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
    { name: "mobile-webkit", use: { ...devices["iPhone 13"] } },
  ],
  // The E2E server runs under launchd (com.dz-platform.e2e) on port 3102 with
  // DATABASE_URL=file:./e2e.db — Playwright reuses it (sandbox-safe). Fallback
  // command only starts if the URL is somehow down.
  webServer: {
    command: 'DATABASE_URL="file:./e2e.db" pnpm start --port 3102',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
