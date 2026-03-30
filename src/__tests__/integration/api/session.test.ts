import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

import { GET } from "@/app/api/auth/session/route";

describe("GET /api/auth/session", () => {
  afterEach(async () => {
    await cleanDb();
    vi.clearAllMocks();
  });

  it("returns { user: null } when no session cookie", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await GET();
    const json = await res.json();
    expect(json.user).toBeNull();
  });

  it("returns { user: null } for an invalid token", async () => {
    mockCookieStore.get.mockReturnValue({ value: "bad.token" });
    const res = await GET();
    const json = await res.json();
    expect(json.user).toBeNull();
  });

  it("returns { user: null } when user is not in DB", async () => {
    const token = await createToken({
      rut: "99999999k",
      email: "ghost@test.com",
    });
    mockCookieStore.get.mockReturnValue({ value: token });
    const res = await GET();
    const json = await res.json();
    expect(json.user).toBeNull();
  });

  it("returns user data when session is valid and user exists", async () => {
    const user = await seedUser({ rut: "12345678k", email: "juan@test.com" });
    const token = await createToken({ rut: user.rut, email: user.email });
    mockCookieStore.get.mockReturnValue({ value: token });

    const res = await GET();
    const json = await res.json();
    expect(json.user).toMatchObject({
      rut: "12345678k",
      firstName: "Juan",
      email: "juan@test.com",
    });
  });
});
