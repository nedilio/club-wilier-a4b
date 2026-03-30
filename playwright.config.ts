import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env.test.local", override: true });

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    env: {
      DATABASE_URL: process.env.DATABASE_URL_TEST!,
      JWT_SECRET: "test-jwt-secret-for-e2e-32chars!!",
      NODE_ENV: "test",
    },
  },
});