import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanDb, seedUser, seedSession } from "../../helpers/db";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

const mockCookieStore = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

import { POST } from "@/app/api/auth/logout/route";

describe("POST /api/auth/logout", () => {
  afterEach(async () => {
    await cleanDb();
    vi.clearAllMocks();
  });

  it("returns { success: true } even when there is no active session", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await POST();
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockCookieStore.delete).toHaveBeenCalledWith("session");
  });

  it("deletes the session from the database and clears the cookie", async () => {
    const user = await seedUser({ rut: "12345678k" });
    const { token } = await seedSession(user.rut);

    mockCookieStore.get.mockReturnValue({ value: token });

    const res = await POST();
    const json = await res.json();
    expect(json.success).toBe(true);

    const sessions = await db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.userRut, user.rut));

    expect(sessions).toHaveLength(0);
    expect(mockCookieStore.delete).toHaveBeenCalledWith("session");
  });
});
