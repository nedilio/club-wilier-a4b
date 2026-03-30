import { config } from "dotenv";
import { execSync } from "child_process";

export async function setup() {
  config({ path: ".env.test.local", override: true });

  const dbUrl = process.env.DATABASE_URL_TEST;
  if (!dbUrl) {
    console.warn(
      "\n⚠️  DATABASE_URL_TEST not set — skipping DB setup. Integration tests will fail.\n",
    );
    return;
  }

  // Make all test workers see the test DB URL as DATABASE_URL
  process.env.DATABASE_URL = dbUrl;

  // drizzle-kit push is idempotent: creates/alters tables to match the current schema
  execSync("pnpm drizzle-kit push --force", {
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: "inherit",
  });
}
