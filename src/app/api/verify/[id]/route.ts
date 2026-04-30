import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const res = await db.query.users.findFirst({
    where: eq(schema.users.qrToken, id),
    columns: {
      qrToken: true,
    },
  });
  if (!res) {
    return NextResponse.json(
      { success: false, error: "Usuario no es válido" },
      { status: 400 },
    );
  }
  return NextResponse.json({
    success: true,
    message: "Verification successful",
  });
}
