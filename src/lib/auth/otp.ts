import { createHash } from "crypto";

export function generateOtp(): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

export function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export function verifyOtp(otp: string, hash: string): boolean {
  const otpHash = hashOtp(otp);
  return otpHash === hash;
}

export function getOtpExpiration(minutes: number = 5): number {
  return Date.now() + minutes * 60 * 1000;
}

export function isOtpExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}
