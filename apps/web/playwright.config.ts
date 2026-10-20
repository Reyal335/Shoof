import { defineConfig } from "@playwright/test";

// Browser checks for the rating UI on /post/demo (mock ratings, no API needed). Uses the Edge or Chrome already on the
// machine (PW_CHANNEL, default msedge), so no browser download. `pnpm test:e2e` starts `next dev` unless one is running.
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    channel: process.env.PW_CHANNEL ?? "msedge",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000/icon.svg",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
