import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { createHash } from "crypto";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production",
);

const COOKIE_NAME = "session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export interface SessionPayload extends JWTPayload {
  rut: string;
  email: string;
}

export async function createToken(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${process.env.JWT_EXPIRES_IN || "7d"}`)
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateQrToken(rut: string): string {
  const secret =
    process.env.JWT_SECRET || "fallback-secret-change-in-production";
  return createHash("sha256")
    .update(rut + secret)
    .digest("hex");
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = await getSessionCookie();
  if (!token) return null;
  return verifyToken(token);
}
