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

vi.mock("@/lib/wallet/apple", () => ({
  generateApplePass: vi.fn().mockReturnValue(Buffer.from("fake-pkpass")),
}));

import { GET } from "@/app/api/wallet/apple/route";

const APPLE_ENV_VARS = [
  "APPLE_PASS_TYPE_ID",
  "APPLE_TEAM_IDENTIFIER",
  "APPLE_WWDR_CERTIFICATE",
  "APPLE_CERTIFICATE",
  "APPLE_PRIVATE_KEY",
] as const;

afterEach(async () => {
  await cleanDb();
  vi.clearAllMocks();
  APPLE_ENV_VARS.forEach((k) => delete process.env[k]);
});

describe("GET /api/wallet/apple", () => {
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

  it("returns 503 when Apple env vars are not configured", async () => {
    const user = await seedUser({
      rut: "12345678k",
      email: "juan@test.com",
      clubWilierNumber: "42",
    });
    const token = await createToken({ rut: user.rut, email: user.email });
    mockCookieStore.get.mockReturnValue({ value: token });

    // No Apple env vars set — 503 expected
    const res = await GET();
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toMatch(/wallet no configurado/i);
  });

  it("returns a pkpass file for a valid member when env vars are configured", async () => {
    const user = await seedUser({
      rut: "12345678k",
      email: "juan@test.com",
      clubWilierNumber: "42",
    });
    const token = await createToken({ rut: user.rut, email: user.email });
    mockCookieStore.get.mockReturnValue({ value: token });

    // Set Apple env vars with stub values
    process.env.APPLE_PASS_TYPE_ID = "pass.cl.test";
    process.env.APPLE_TEAM_IDENTIFIER = "TEAMID123";
    process.env.APPLE_WWDR_CERTIFICATE = Buffer.from("wwdr").toString("base64");
    process.env.APPLE_CERTIFICATE = Buffer.from("cert").toString("base64");
    process.env.APPLE_PRIVATE_KEY = Buffer.from("key").toString("base64");

    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "application/vnd.apple.pkpass",
    );
  });
});
