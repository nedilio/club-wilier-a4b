import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getSession, clearSessionCookie } from "@/lib/auth/jwt";

export async function POST() {
  try {
    const session = await getSession();

    if (session) {
      await db
        .delete(schema.sessions)
        .where(eq(schema.sessions.userRut, session.rut));
    }

    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  }
}
