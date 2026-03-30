import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateOtp,
  hashOtp,
  verifyOtp,
  getOtpExpiration,
  isOtpExpired,
} from "@/lib/auth/otp";

describe("generateOtp", () => {
  it("generates a 6-digit string", () => {
    const otp = generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it("generates different codes on subsequent calls", () => {
    const values = new Set(Array.from({ length: 10 }, () => generateOtp()));
    expect(values.size).toBeGreaterThan(1);
  });
});

describe("hashOtp", () => {
  it("returns a 64-char hex string (SHA256)", () => {
    const hash = hashOtp("123456");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic", () => {
    expect(hashOtp("123456")).toBe(hashOtp("123456"));
  });

  it("produces different hashes for different inputs", () => {
    expect(hashOtp("123456")).not.toBe(hashOtp("654321"));
  });
});

describe("verifyOtp", () => {
  it("returns true for matching otp and hash", () => {
    const otp = "123456";
    const hash = hashOtp(otp);
    expect(verifyOtp(otp, hash)).toBe(true);
  });

  it("returns false for wrong otp", () => {
    const hash = hashOtp("123456");
    expect(verifyOtp("999999", hash)).toBe(false);
  });
});

describe("getOtpExpiration", () => {
  it("returns a timestamp in the future", () => {
    const before = Date.now();
    const expiry = getOtpExpiration(5);
    const after = Date.now();
    expect(expiry).toBeGreaterThanOrEqual(before + 5 * 60 * 1000);
    expect(expiry).toBeLessThanOrEqual(after + 5 * 60 * 1000 + 100);
  });

  it("defaults to 5 minutes", () => {
    const expiry = getOtpExpiration();
    expect(expiry - Date.now()).toBeCloseTo(5 * 60 * 1000, -3);
  });
});

describe("isOtpExpired", () => {
  it("returns true for a past timestamp", () => {
    expect(isOtpExpired(Date.now() - 1000)).toBe(true);
  });

  it("returns false for a future timestamp", () => {
    expect(isOtpExpired(Date.now() + 60_000)).toBe(false);
  });
});
