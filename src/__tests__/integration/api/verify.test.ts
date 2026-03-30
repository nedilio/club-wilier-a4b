import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { cleanDb, seedUser, seedOtpForTest } from "../../helpers/db";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

vi.mock("@/lib/auth/bsale", () => ({
  getClientByRut: vi.fn(),
  extractClubWilierNumber: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

import { getClientByRut, extractClubWilierNumber } from "@/lib/auth/bsale";
import { POST } from "@/app/api/auth/verify/route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// 76354771-K is a valid Chilean RUT (sum=155, dv=k)
const validRut = "76354771-k";
const knownCode = "123456";

const mockClient = {
  id: 1,
  firstName: "Juan",
  lastName: "Pérez",
  email: "test@test.com",
  code: "76354771-k",
  phone: "",
  company: "",
  state: 0,
  activity: "",
  hasCredit: 0,
  maxCredit: 0,
  points: 0,
};

describe("POST /api/auth/verify", () => {
  afterEach(async () => {
    await cleanDb();
  });

  describe("validation", () => {
    it("returns 400 when rut is missing", async () => {
      const res = await POST(makeRequest({ code: knownCode }));
      expect(res.status).toBe(400);
    });

    it("returns 400 when code is not 6 digits", async () => {
      const res = await POST(makeRequest({ rut: validRut, code: "123" }));
      expect(res.status).toBe(400);
    });
  });

  describe("OTP checks", () => {
    it("returns 400 when no OTP record exists", async () => {
      const res = await POST(makeRequest({ rut: validRut, code: knownCode }));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Código inválido o expirado");
    });

    it("returns 400 for an incorrect code", async () => {
      await seedOtpForTest(validRut, knownCode);
      const res = await POST(makeRequest({ rut: validRut, code: "000000" }));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Código inválido");
    });

    it("returns 400 for an already-used OTP", async () => {
      const record = await seedOtpForTest(validRut, knownCode);
      // Mark as used manually
      await db
        .update(schema.otpCodes)
        .set({ usedAt: new Date() })
        .where(eq(schema.otpCodes.id, record.id));

      const res = await POST(makeRequest({ rut: validRut, code: knownCode }));
      expect(res.status).toBe(400);
    });
  });

  describe("happy path", () => {
    beforeEach(() => {
      vi.mocked(getClientByRut).mockResolvedValue(mockClient);
      vi.mocked(extractClubWilierNumber).mockReturnValue("42");
    });

    it("returns 200 on success", async () => {
      await seedOtpForTest(validRut, knownCode);
      const res = await POST(makeRequest({ rut: validRut, code: knownCode }));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it("upserts the user in the database", async () => {
      await seedOtpForTest(validRut, knownCode);
      await POST(makeRequest({ rut: validRut, code: knownCode }));

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.rut, validRut));

      expect(user).toBeDefined();
      expect(user.firstName).toBe("Juan");
      expect(user.email).toBe("test@test.com");
    });

    it("creates a session in the database", async () => {
      await seedOtpForTest(validRut, knownCode);
      await POST(makeRequest({ rut: validRut, code: knownCode }));

      const sessions = await db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.userRut, validRut));

      expect(sessions).toHaveLength(1);
    });

    it("marks the OTP as used", async () => {
      await seedOtpForTest(validRut, knownCode);
      await POST(makeRequest({ rut: validRut, code: knownCode }));

      const otps = await db
        .select()
        .from(schema.otpCodes)
        .where(eq(schema.otpCodes.rut, validRut));

      expect(otps[0].usedAt).not.toBeNull();
    });
  });
});
