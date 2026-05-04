import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string; passTypeId: string }> },
) {
  const { deviceId } = await params;
  const { searchParams } = new URL(req.url);
  const updatedSince = searchParams.get("passesUpdatedSince");

  console.log({
    message: "Buscando pases actualizados para el dispositivo...",
    deviceId,
    updatedSince,
  });

  const registrations = await db
    .select()
    .from(schema.walletRegistrations)
    .where(eq(schema.walletRegistrations.deviceId, deviceId));

  if (registrations.length === 0) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({
    lastUpdated: new Date().toISOString(),
    serialNumbers: registrations.map((registration) => registration.serialNumber),
  });
}
