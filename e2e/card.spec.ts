import { test, expect } from "@playwright/test";
import { cleanDb, seedUser, seedSession } from "../src/__tests__/helpers/db";

test.beforeEach(async () => {
  await cleanDb();
});

test.afterAll(async () => {
  await cleanDb();
});

test("GET /card without a session redirects to /login", async ({ page }) => {
  await page.goto("/card");
  await expect(page).toHaveURL(/\/login/);
});

test("GET /card with a valid session shows the membership card", async ({
  page,
}) => {
  const user = await seedUser({
    rut: "12345678k",
    firstName: "Ana",
    lastName: "González",
    clubWilierNumber: "7",
  });

  const { token } = await seedSession(user.rut);

  await page.context().addCookies([
    {
      name: "session",
      value: token,
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.goto("/card");
  await expect(page).toHaveURL(/\/card/);
  await expect(page.getByText(/Ana/i)).toBeVisible();
  await expect(page.getByText(/González/i)).toBeVisible();
});
