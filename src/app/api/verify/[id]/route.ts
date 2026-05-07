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
      rut: true,
      membershipName: true,
    },
  });
  if (!res) {
    return NextResponse.json(
      { success: false, error: "Usuario no es válido" },
      { status: 400 },
    );
  }
  // Construyes la URL de destino
  const url = request.nextUrl.clone();
  url.pathname = "/verify";
  url.searchParams.set("rut", res.rut);
  if (res.membershipName) {
    url.searchParams.set("membership", res.membershipName);
  }

  return NextResponse.redirect(url, 307);
}
