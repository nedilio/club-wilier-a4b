import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  rut: text("rut").primaryKey(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  email: text("email").notNull(),
  clubWilierNumber: text("clubWilierNumber"),
  qrToken: text("qrToken"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
  lastSyncedAt: timestamp("lastSyncedAt", { mode: "date" }).notNull(),
});

export const otpCodes = pgTable("otp_codes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  rut: text("rut").notNull(),
  email: text("email"),
  codeHash: text("codeHash").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  usedAt: timestamp("usedAt", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
});

export const sessions = pgTable("sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userRut: text("userRut")
    .notNull()
    .references(() => users.rut),
  tokenHash: text("tokenHash").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
});

export const walletRegistrations = pgTable("wallet_registrations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("userId")
    .notNull()
    .references(() => users.rut),
  platform: text("platform").notNull(),
  serialNumber: text("serialNumber").notNull(),
  deviceId: text("deviceId").notNull(),
  pushToken: text("pushToken").notNull(),
  authToken: text("authToken").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" })
    .notNull()
    .defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  message: text("message").notNull(),
  sentAt: timestamp("sentAt", { mode: "date" }).notNull().defaultNow(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type OtpCode = typeof otpCodes.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type WalletRegistration = typeof walletRegistrations.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
