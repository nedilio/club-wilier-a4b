import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";

const mocks = vi.hoisted(() => ({ cookie: vi.fn(), findFirst: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: mocks.cookie }) }));
vi.mock("@/db", async () => ({
  schema: await import("@/db/schema"),
  db: { query: { sessions: { findFirst: mocks.findFirst } } },
}));

import { authorizeNotifications, canSendNotifications } from "@/lib/auth/admin";
import { createToken, hashToken } from "@/lib/auth/jwt";

describe("notification authorization", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("ADMIN_EMAILS", "admin@test.cl, other@test.cl");
    mocks.findFirst.mockResolvedValue({ id: 1 });
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  async function cookie(email = "admin@test.cl") {
    const token = await createToken({ rut: "76354771k", email });
    mocks.cookie.mockReturnValue({ value: token });
    return token;
  }

  it("normalizes the configured emails and rejects empty values", () => {
    vi.stubEnv("ADMIN_EMAILS", " ADMIN@test.cl ,other@test.cl, ");
    expect(canSendNotifications(" admin@TEST.cl ")).toBe(true);
    expect(canSendNotifications("other@test.cl")).toBe(true);
    expect(canSendNotifications("")).toBe(false);
    expect(canSendNotifications("stranger@test.cl")).toBe(false);
  });

  it.each([undefined, "", " , "])("denies all administrators with list %s", async (value) => {
    vi.stubEnv("ADMIN_EMAILS", value);
    await cookie();
    expect(await authorizeNotifications()).toMatchObject({ authorized: false, status: 403 });
  });

  it("rejects a missing cookie without querying the database", async () => {
    expect(await authorizeNotifications()).toMatchObject({ authorized: false, status: 401 });
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });

  it("rejects an invalid JWT without querying the database", async () => {
    mocks.cookie.mockReturnValue({ value: "invalid-jwt" });
    expect(await authorizeNotifications()).toMatchObject({ authorized: false, status: 401 });
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });

  it("rejects an expired JWT without querying the database", async () => {
    vi.stubEnv("JWT_EXPIRES_IN", "-1s");
    await cookie();
    expect(await authorizeNotifications()).toMatchObject({ authorized: false, status: 401 });
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });

  it("rejects a deleted, mismatched or expired database session", async () => {
    await cookie();
    mocks.findFirst.mockResolvedValue(undefined);
    expect(await authorizeNotifications()).toMatchObject({ authorized: false, status: 401 });
  });

  it("checks the token hash, owner and database expiration before allowing an admin", async () => {
    const token = await cookie();
    const before = Date.now();
    expect(await authorizeNotifications()).toEqual({ authorized: true });
    const { where } = mocks.findFirst.mock.calls[0][0];
    const query = new PgDialect().sqlToQuery(where);
    expect(query.sql).toContain('"sessions"."userRut" =');
    expect(query.sql).toContain('"sessions"."tokenHash" =');
    expect(query.sql).toContain('"sessions"."expiresAt" >');
    expect(query.params.slice(0, 2)).toEqual(["76354771k", hashToken(token)]);
    expect(new Date(query.params[2] as string).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("rejects a non-admin with a valid session", async () => {
    await cookie("user@test.cl");
    expect(await authorizeNotifications()).toMatchObject({ authorized: false, status: 403 });
  });

  it("fails closed when the database is unavailable without exposing its error", async () => {
    await cookie();
    mocks.findFirst.mockRejectedValue(new Error("secret database details"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await authorizeNotifications();
    expect(result).toMatchObject({ authorized: false, status: 503 });
    expect(JSON.stringify(result)).not.toContain("secret");
    expect(log).toHaveBeenCalled();
  });
});
