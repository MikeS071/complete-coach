import { defineConfig, devices } from "@playwright/test";
import { loadLocalEnvFiles } from "./lib/env-loader";

loadLocalEnvFiles();

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const host = "localhost";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://${host}:${port}`;

process.env.AUTH_URL = baseURL;
process.env.NEXTAUTH_URL = baseURL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["junit", { outputFile: "test-results/e2e-junit.xml" }]] : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 30_000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: `pnpm dev -- --hostname ${host} --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
