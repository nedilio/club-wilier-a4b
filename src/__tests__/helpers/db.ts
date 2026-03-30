import { db, schema } from "@/db";
import { hashOtp, getOtpExpiration } from "@/lib/auth/otp";
import { hashToken, createToken } from "@/lib/auth/jwt";

/**
 * Remove all rows from the test database tables used for authentication.
 *
 * Deletes records from `sessions`, `otpCodes`, and `users` to reset database state between tests.
 */
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

/**
 * Create and insert a default test user into the database, applying any provided overrides.
 *
 * @param overrides - Partial fields to override the default seeded user values (e.g., `rut`, `email`, `firstName`, `lastName`, `clubWilierNumber`, `qrToken`)
 * @returns The user object that was inserted, including `createdAt`, `updatedAt`, and `lastSyncedAt` timestamps
 */
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

/**
 * Create and insert a test OTP code record for a user.
 *
 * The provided `knownCode` is hashed before storage and the record is inserted
 * with an expiration computed by the OTP helper (5-minute duration).
 *
 * @param rut - The user's unique identifier (RUT) for whom the OTP is created
 * @param knownCode - The plaintext one-time code to be hashed and stored
 * @param email - The email associated with the OTP; defaults to "test@test.com"
 * @returns The inserted OTP code row from the database
 */
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

/**
 * Creates a new session record for the given user and returns the stored session alongside its plaintext token.
 *
 * @param userRut - The user's unique identifier (RUT) to associate the session with
 * @returns An object containing `session` (the inserted session row) and `token` (the plaintext JWT issued for that session)
 */
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
