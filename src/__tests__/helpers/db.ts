import { db, schema } from "@/db";
import { hashOtp, getOtpExpiration } from "@/lib/auth/otp";
import { hashToken, createToken } from "@/lib/auth/jwt";

export async function cleanDb() {
  await db.delete(schema.sessions);
  await db.delete(schema.otpCodes);
  await db.delete(schema.users);
}

interface SeedUserOptions {
  rut?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  clubWilierNumber?: string | null;
  qrToken?: string | null;
}

export async function seedUser(overrides: SeedUserOptions = {}) {
  const now = new Date();
  const user = {
    rut: "12345678k",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan@test.com",
    clubWilierNumber: "42",
    qrToken: null,
    createdAt: now,
    updatedAt: now,
    lastSyncedAt: now,
    ...overrides,
  };
  await db.insert(schema.users).values(user);
  return user;
}

export async function seedOtpForTest(
  rut: string,
  knownCode: string,
  email = "test@test.com",
) {
  const codeHash = hashOtp(knownCode);
  const expiresAt = new Date(getOtpExpiration(5));
  const now = new Date();
  const [record] = await db
    .insert(schema.otpCodes)
    .values({ rut, email, codeHash, expiresAt, createdAt: now })
    .returning();
  return record;
}

export async function seedSession(userRut: string) {
  const token = await createToken({ rut: userRut, email: "test@test.com" });
  const now = new Date();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const [session] = await db
    .insert(schema.sessions)
    .values({
      userRut,
      tokenHash: hashToken(token),
      expiresAt,
      createdAt: now,
    })
    .returning();
  return { session, token };
}
