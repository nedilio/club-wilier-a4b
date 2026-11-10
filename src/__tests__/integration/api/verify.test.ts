import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { seedUser, cleanDb, seedOtpForTest } from "../../helpers/db";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

vi.mock("@/lib/auth/bsale", () => ({
  getClientByRut: vi.fn(),
  getMembershipName: vi.fn(),
}));

vi.mock("@/app/api/wallet/apple/push/push", () => ({
  sendPassUpdatePush: vi.fn(),
}));

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (cb: () => unknown) => cb(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

import { getClientByRut, getMembershipName } from "@/lib/auth/bsale";
import { POST } from "@/app/api/auth/verify/route";
import { generateQrToken } from "@/lib/auth/jwt";
import { sendPassUpdatePush } from "@/app/api/wallet/apple/push/push";

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

  describe("existing user BSale sync", () => {
    const past = new Date("2025-01-01T00:00:00Z");

    async function getSaved() {
      const [saved] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.rut, validRut));
      return saved;
    }

    beforeEach(() => {
      vi.mocked(getClientByRut).mockReset();
      vi.mocked(getMembershipName).mockReset();
      vi.mocked(sendPassUpdatePush).mockReset();
    });

    async function loginWithBsale(
      membership: Awaited<ReturnType<typeof getMembershipName>>,
    ) {
      vi.mocked(getClientByRut).mockResolvedValue(mockClient);
      vi.mocked(getMembershipName).mockResolvedValue(membership);
      await seedOtpForTest(validRut, knownCode);
      return POST(makeRequest({ rut: validRut, code: knownCode }));
    }

    describe("Apple Wallet pass update", () => {
      const member = {
        rut: validRut,
        firstName: mockClient.firstName,
        lastName: mockClient.lastName,
        clubWilierNumber: "42",
        membershipName: "Premium",
        qrToken: "existing-qr",
      };

      it("pushes when a member's membership changes", async () => {
        await seedUser(member);
        await loginWithBsale({ clientId: "42", membershipName: "Gold" });
        expect(sendPassUpdatePush).toHaveBeenCalledWith(validRut);
      });

      it("does not push when nothing visible on the pass changed", async () => {
        await seedUser(member);
        await loginWithBsale({ clientId: "42", membershipName: "Premium" });
        expect(sendPassUpdatePush).not.toHaveBeenCalled();
      });

      it("does not push when the membership is lost", async () => {
        await seedUser(member);
        await loginWithBsale({ clientId: null, membershipName: null });
        expect(sendPassUpdatePush).not.toHaveBeenCalled();
      });

      it("does not push when the user just became a member", async () => {
        await seedUser({ ...member, clubWilierNumber: null, membershipName: null, qrToken: null });
        await loginWithBsale({ clientId: "42", membershipName: "Premium" });
        expect(sendPassUpdatePush).not.toHaveBeenCalled();
      });
    });

    it("assigns membership when BSale now has one", async () => {
      await seedUser({
        rut: validRut,
        clubWilierNumber: null,
        qrToken: null,
        lastSyncedAt: past,
      });
      vi.mocked(getClientByRut).mockResolvedValue(mockClient);
      vi.mocked(getMembershipName).mockResolvedValue({
        clientId: "42",
        membershipName: "Premium",
      });
      await seedOtpForTest(validRut, knownCode);

      const res = await POST(makeRequest({ rut: validRut, code: knownCode }));
      expect(res.status).toBe(200);

      const saved = await getSaved();
      expect(saved.membershipName).toBe("Premium");
      expect(saved.clubWilierNumber).toBe("42");
      expect(saved.qrToken).toBe(generateQrToken(validRut));
      expect(saved.lastSyncedAt.getTime()).toBeGreaterThan(past.getTime());
    });

    it("clears membership but keeps qrToken when BSale no longer has one", async () => {
      await seedUser({
        rut: validRut,
        membershipName: "Premium",
        qrToken: "existing-qr",
      });
      vi.mocked(getClientByRut).mockResolvedValue(mockClient);
      vi.mocked(getMembershipName).mockResolvedValue({
        clientId: null,
        membershipName: null,
      });
      await seedOtpForTest(validRut, knownCode);

      const res = await POST(makeRequest({ rut: validRut, code: knownCode }));
      expect(res.status).toBe(200);

      const saved = await getSaved();
      expect(saved.membershipName).toBeNull();
      expect(saved.clubWilierNumber).toBeNull();
      expect(saved.qrToken).toBe("existing-qr");
    });

    it("logs in with local data when BSale throws", async () => {
      const user = await seedUser({
        rut: validRut,
        membershipName: "Premium",
        qrToken: "existing-qr",
        lastSyncedAt: past,
      });
      vi.mocked(getClientByRut).mockRejectedValue(new Error("BSale down"));
      vi.spyOn(console, "error").mockImplementation(() => {});
      await seedOtpForTest(validRut, knownCode);

      const res = await POST(makeRequest({ rut: validRut, code: knownCode }));
      expect(res.status).toBe(200);

      const saved = await getSaved();
      expect(saved.membershipName).toBe("Premium");
      expect(saved.qrToken).toBe(user.qrToken);
      expect(saved.lastSyncedAt).toEqual(past);
      const sessions = await db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.userRut, validRut));
      expect(sessions).toHaveLength(1);
    });

    it("logs in with local data when BSale returns no client", async () => {
      await seedUser({
        rut: validRut,
        membershipName: "Premium",
        qrToken: "existing-qr",
        lastSyncedAt: past,
      });
      vi.mocked(getClientByRut).mockResolvedValue(null);
      await seedOtpForTest(validRut, knownCode);

      const res = await POST(makeRequest({ rut: validRut, code: knownCode }));
      expect(res.status).toBe(200);

      const saved = await getSaved();
      expect(saved.membershipName).toBe("Premium");
      expect(saved.qrToken).toBe("existing-qr");
      expect(saved.lastSyncedAt).toEqual(past);
      expect(getMembershipName).not.toHaveBeenCalled();
    });
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
      vi.mocked(getMembershipName).mockResolvedValue({
        clientId: "42",
        membershipName: "Premium",
      });
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
