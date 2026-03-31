import { describe, it, expect } from "vitest";
import { validateRut, formatRut, cleanRut } from "@/lib/auth/rut";

describe("cleanRut", () => {
  it("removes dots and spaces and lowercases", () => {
    expect(cleanRut("12.345.678-K")).toBe("12345678-k");
    expect(cleanRut("12 345 678-K")).toBe("12345678-k");
    expect(cleanRut("12.345.678-k")).toBe("12345678-k");
  });

  it("leaves plain rut unchanged", () => {
    expect(cleanRut("12345678k")).toBe("12345678k");
  });
});

// Valid test RUTs (Chilean algorithm verified):
// 11111111-1 : sum=32, 11-(32%11)=1 ✓
// 22222222-2 : sum=64, 11-(64%11)=2 ✓
// 76354771-K : sum=155, 11-(155%11)=10 → k ✓
describe("validateRut", () => {
  it("accepts valid RUTs", () => {
    expect(validateRut("111111111")).toBe(true);
    expect(validateRut("11111111-1")).toBe(true);
    expect(validateRut("76354771-K")).toBe(true);
    expect(validateRut("11.111.111-1")).toBe(true);
    expect(validateRut("76.354.771-K")).toBe(true);
    expect(validateRut("76.354.771-k")).toBe(true);
  });

  it("rejects invalid check digit", () => {
    expect(validateRut("123456789")).toBe(false);
    expect(validateRut("12345678-9")).toBe(false);
  });

  it("rejects invalid check digit in formatted RUT", () => {
    expect(validateRut("12.345.678-9")).toBe(false);
  });

  it("rejects wrong length", () => {
    expect(validateRut("1234567")).toBe(false);
    expect(validateRut("1234567890")).toBe(false);
  });

  it("handles dígito verificador K (uppercase and lowercase)", () => {
    expect(validateRut("76354771k")).toBe(true);
    expect(validateRut("76354771K")).toBe(true);
  });
});

describe("formatRut", () => {
  it("formats to XX.XXX.XXX-D pattern", () => {
    expect(formatRut("76354771k")).toBe("76.354.771-K");
    expect(formatRut("222222222")).toBe("22.222.222-2");
  });

  it("formats RUT with numeric check digit", () => {
    expect(formatRut("111111111")).toBe("11.111.111-1");
  });

  it("returns input unchanged if too short", () => {
    expect(formatRut("123456")).toBe("123456");
  });
});
