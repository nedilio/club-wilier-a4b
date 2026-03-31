import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanDb, seedUser } from "../../helpers/db";
import { createToken } from "@/lib/auth/jwt";

const mockCookieStore = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

vi.mock("@/lib/wallet/google", () => ({
  buildGoogleWalletUrl: vi
    .fn()
    .mockResolvedValue("https://pay.google.com/gp/v/save/fake.jwt.token"),
}));

import { GET } from "@/app/api/wallet/google/route";

const GOOGLE_ENV_VARS = [
  "GOOGLE_WALLET_ISSUER_ID",
  "GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY",
] as const;

afterEach(async () => {
  await cleanDb();
  vi.clearAllMocks();
  GOOGLE_ENV_VARS.forEach((k) => delete process.env[k]);
});

describe("GET /api/wallet/google", () => {
  it("returns 401 when there is no session cookie", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 401 for an invalid token", async () => {
    mockCookieStore.get.mockReturnValue({ value: "bad.token" });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not a member", async () => {
    const user = await seedUser({
      rut: "12345678k",
      email: "juan@test.com",
      clubWilierNumber: null,
    });
    const token = await createToken({ rut: user.rut, email: user.email });
    mockCookieStore.get.mockReturnValue({ value: token });

    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("returns 503 when Google env vars are not configured", async () => {
    const user = await seedUser({
      rut: "12345678k",
      email: "juan@test.com",
      clubWilierNumber: "42",
    });
    const token = await createToken({ rut: user.rut, email: user.email });
    mockCookieStore.get.mockReturnValue({ value: token });

    // No Google env vars set — 503 expected
    const res = await GET();
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toMatch(/wallet no configurado/i);
  });

  it("redirects to Google Wallet URL for a valid member", async () => {
    const user = await seedUser({
      rut: "12345678k",
      email: "juan@test.com",
      clubWilierNumber: "42",
    });
    const token = await createToken({ rut: user.rut, email: user.email });
    mockCookieStore.get.mockReturnValue({ value: token });

    // Set Google env vars with stub values
    process.env.GOOGLE_WALLET_ISSUER_ID = "3388000000000000000";
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL =
      "test@project.iam.gserviceaccount.com";
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY =
      Buffer.from("fake-key").toString("base64");

    const res = await GET();
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://pay.google.com/gp/v/save/fake.jwt.token",
    );
  });
});
