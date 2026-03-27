import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/jwt";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null });
    }

    const [user] = await db
      .select({
        rut: schema.users.rut,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        email: schema.users.email,
        clubWilierNumber: schema.users.clubWilierNumber,
      })
      .from(schema.users)
      .where(eq(schema.users.rut, session.rut));

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null });
  }
}
