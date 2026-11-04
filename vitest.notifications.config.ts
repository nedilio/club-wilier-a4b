import { defineConfig } from "vitest/config";
import baseConfig from "./vitest.config";

// These tests mock the database and APNs; never run the database global setup.
export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    globalSetup: [],
    include: [
      "src/__tests__/unit/lib/auth/admin.test.ts",
      "src/__tests__/unit/apple-push-route.test.ts",
      "src/__tests__/unit/apple-push-service.test.ts",
    ],
  },
});
