import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  rut: text("rut").primaryKey(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  email: text("email").notNull(),
  clubWilierNumber: text("clubWilierNumber"),
  qrToken: text("qrToken"),
  createdAt: integer("createdAt").notNull(),
  updatedAt: integer("updatedAt").notNull(),
  lastSyncedAt: integer("lastSyncedAt").notNull(),
});

export const otpCodes = sqliteTable("otp_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  rut: text("rut").notNull(),
  email: text("email"),
  codeHash: text("codeHash").notNull(),
  expiresAt: integer("expiresAt").notNull(),
  usedAt: integer("usedAt"),
  createdAt: integer("createdAt").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userRut: text("userRut")
    .notNull()
    .references(() => users.rut),
  tokenHash: text("tokenHash").notNull(),
  expiresAt: integer("expiresAt").notNull(),
  createdAt: integer("createdAt").notNull(),
});

export type User = typeof users.$inferSelect;
export type OtpCode = typeof otpCodes.$inferSelect;
export type Session = typeof sessions.$inferSelect;
