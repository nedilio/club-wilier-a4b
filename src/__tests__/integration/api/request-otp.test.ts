import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { cleanDb } from "../../helpers/db";
import { db, schema } from "@/db";

// Mock external services — real DB is used via DATABASE_URL → DATABASE_URL_TEST
vi.mock("@/lib/auth/bsale", () => ({
  getClientByRut: vi.fn(),
  extractClubWilierNumber: vi.fn(),
  isClientActive: vi.fn(),
}));

vi.mock("@/lib/auth/email", () => ({
  sendOtpEmail: vi.fn().mockResolvedValue(undefined),
}));

// Cookie store not needed for this route but required by next/headers import chain
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

import { getClientByRut } from "@/lib/auth/bsale";
import { sendOtpEmail } from "@/lib/auth/email";
import { POST } from "@/app/api/auth/request-otp/route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/request-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// 76354771-K is a valid Chilean RUT (sum=155, dv=k)
const validRut = "76354771-k";
const validBody = { email: "test@test.com", rut: validRut };

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

describe("POST /api/auth/request-otp", () => {
  afterEach(async () => {
    await cleanDb();
  });

  describe("validation", () => {
    it("returns 400 when body is missing", async () => {
      const req = new NextRequest("http://localhost/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid email", async () => {
      const res = await POST(
        makeRequest({ email: "not-an-email", rut: validRut }),
      );
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid RUT", async () => {
      const res = await POST(
        makeRequest({ email: "test@test.com", rut: "12345678-9" }),
      );
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("RUT inválido");
      expect(getClientByRut).not.toHaveBeenCalled();
    });
  });

  describe("BSale integration", () => {
    it("returns 404 when RUT is not found in BSale", async () => {
      vi.mocked(getClientByRut).mockResolvedValue(null);
      const res = await POST(makeRequest(validBody));
      expect(res.status).toBe(404);
    });
  });

  describe("happy path", () => {
    beforeEach(() => {
      vi.mocked(getClientByRut).mockResolvedValue(mockClient);
      vi.mocked(sendOtpEmail).mockResolvedValue(undefined);
    });

    it("returns 200 with success message", async () => {
      const res = await POST(makeRequest(validBody));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it("stores an OTP record in the database", async () => {
      await POST(makeRequest(validBody));
      const otps = await db.select().from(schema.otpCodes);
      expect(otps).toHaveLength(1);
      expect(otps[0].rut).toBe(validRut);
      expect(otps[0].email).toBe("test@test.com");
    });

    it("calls sendOtpEmail with correct params", async () => {
      await POST(makeRequest(validBody));
      expect(vi.mocked(sendOtpEmail)).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@test.com",
          name: "Juan Pérez",
        }),
      );
    });

    it("deletes unused OTPs for the same RUT before creating a new one", async () => {
      // First request
      await POST(makeRequest(validBody));
      // Second request should replace the first OTP
      await POST(makeRequest(validBody));

      const otps = await db.select().from(schema.otpCodes);
      expect(otps).toHaveLength(1);
    });
  });
});