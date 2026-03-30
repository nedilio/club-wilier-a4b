import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { config } from "dotenv";

config({ path: ".env.test.local", override: true });

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    exclude: ["e2e/**", "**/node_modules/**"],
    fileParallelism: false,
    globalSetup: ["./src/__tests__/global-setup.ts"],
    setupFiles: ["./src/__tests__/setup.ts"],
    env: {
      DATABASE_URL: process.env.DATABASE_URL_TEST ?? "",
      JWT_SECRET: "test-jwt-secret-for-vitest-32chars!",
      RESEND_API_KEY: "re_test_key",
      BSALE_ACCESS_TOKEN: "bsale_test_token",
      NODE_ENV: "test",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
