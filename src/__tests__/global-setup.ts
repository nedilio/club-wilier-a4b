import { config } from "dotenv";
import { execSync } from "child_process";

/**
 * Prepare the test environment and apply the current schema to the test database if configured.
 *
 * Loads environment variables from `.env.test.local`, sets `process.env.DATABASE_URL` to the
 * `DATABASE_URL_TEST` value for test workers, and runs the schema push command when a test
 * database URL is present. If `DATABASE_URL_TEST` is not set, the function logs a warning and
 * exits without modifying the database.
 *
 * @returns Resolves when setup completes
 */
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
