import { test, expect } from "@playwright/test";
import { db, schema } from "../src/db";
import { hashOtp, getOtpExpiration } from "../src/lib/auth/otp";
import { cleanDb, seedOtpForTest } from "../src/__tests__/helpers/db";

const VALID_RUT = "12345678k";

test.beforeEach(async () => {
  await cleanDb();
});

test.afterAll(async () => {
  await cleanDb();
});

test("GET / redirects to /login", async ({ page }) => {
  const response = await page.goto("/");
  expect(page.url()).toContain("/login");
});

test("GET /login renders the login form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/rut/i)).toBeVisible();
});

test("submitting invalid data shows an error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("not-an-email");
  await page.getByLabel(/rut/i).fill("00000000-0");
  await page.getByRole("button", { name: /solicitar/i }).click();
  // The API will return an error; either client-side validation or API error is shown
  await expect(page.locator("text=/error|inválido/i")).toBeVisible({
    timeout: 5000,
  });
});

test("full auth flow: seed OTP → complete login → land on /card", async ({
  page,
}) => {
  const KNOWN_CODE = "424242";

  // Pre-seed a user and an OTP with a known code (A2 strategy)
  await db.insert(schema.users).values({
    rut: VALID_RUT,
    firstName: "Test",
    lastName: "E2E",
    email: "e2e@test.com",
    clubWilierNumber: "99",
    qrToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSyncedAt: new Date(),
  });

  await seedOtpForTest(VALID_RUT, KNOWN_CODE, "e2e@test.com");

  // Step 1: request-otp form (we have a BSale mock available only in unit tests,
  // so we bypass the form and call verify directly with the seeded OTP)
  const res = await page.request.post("/api/auth/verify", {
    data: { rut: VALID_RUT, code: KNOWN_CODE },
  });
  expect(res.ok()).toBe(true);

  // Manually set the session cookie returned by the API
  const cookies = res.headers()["set-cookie"];
  expect(cookies).toBeDefined();
  const match = cookies!.match(/session=([^;]+)/);
  expect(match).not.toBeNull();
  await page.context().addCookies([
    {
      name: "session",
      value: match![1],
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.goto("/card");
  await expect(page).toHaveURL(/\/card/);
});
