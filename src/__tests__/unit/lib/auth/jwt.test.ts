import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createToken,
  verifyToken,
  hashToken,
  generateQrToken,
  setSessionCookie,
  getSessionCookie,
  clearSessionCookie,
  getSession,
} from "@/lib/auth/jwt";

// vi.hoisted ensures mockCookieStore is initialized before vi.mock hoisting runs
const mockCookieStore = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

const TEST_PAYLOAD = { rut: "12345678k", email: "test@test.com" };

describe("createToken / verifyToken", () => {
  it("creates a verifiable JWT with the correct payload", async () => {
    const token = await createToken(TEST_PAYLOAD);
    const payload = await verifyToken(token);
    expect(payload?.rut).toBe(TEST_PAYLOAD.rut);
    expect(payload?.email).toBe(TEST_PAYLOAD.email);
  });

  it("verifyToken returns null for an invalid token", async () => {
    const result = await verifyToken("not.a.jwt");
    expect(result).toBeNull();
  });

  it("verifyToken returns null for a tampered token", async () => {
    const token = await createToken(TEST_PAYLOAD);
    const result = await verifyToken(token + "tampered");
    expect(result).toBeNull();
  });
});

describe("hashToken / generateQrToken", () => {
  it("hashToken returns a 64-char hex string", () => {
    expect(hashToken("sometoken")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("hashToken is deterministic", () => {
    expect(hashToken("sometoken")).toBe(hashToken("sometoken"));
  });

  it("generateQrToken is deterministic for the same rut", () => {
    expect(generateQrToken("12345678k")).toBe(generateQrToken("12345678k"));
  });

  it("generateQrToken differs for different ruts", () => {
    expect(generateQrToken("12345678k")).not.toBe(generateQrToken("87654321k"));
  });
});

describe("setSessionCookie", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls cookieStore.set with the token and correct options", async () => {
    await setSessionCookie("mytoken");
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "session",
      "mytoken",
      expect.objectContaining({ httpOnly: true, path: "/" }),
    );
  });
});

describe("getSessionCookie", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the cookie value when present", async () => {
    mockCookieStore.get.mockReturnValue({ value: "mytoken" });
    expect(await getSessionCookie()).toBe("mytoken");
  });

  it("returns null when cookie is absent", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    expect(await getSessionCookie()).toBeNull();
  });
});

describe("clearSessionCookie", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls cookieStore.delete with session name", async () => {
    await clearSessionCookie();
    expect(mockCookieStore.delete).toHaveBeenCalledWith("session");
  });
});

describe("getSession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when no cookie is set", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    expect(await getSession()).toBeNull();
  });

  it("returns null for an invalid token", async () => {
    mockCookieStore.get.mockReturnValue({ value: "bad.token" });
    expect(await getSession()).toBeNull();
  });

  it("returns the session payload for a valid token", async () => {
    const token = await createToken(TEST_PAYLOAD);
    mockCookieStore.get.mockReturnValue({ value: token });
    const session = await getSession();
    expect(session?.rut).toBe(TEST_PAYLOAD.rut);
    expect(session?.email).toBe(TEST_PAYLOAD.email);
  });
});
