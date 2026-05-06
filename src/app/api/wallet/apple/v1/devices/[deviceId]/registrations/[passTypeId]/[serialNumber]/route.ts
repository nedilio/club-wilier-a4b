import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      deviceId: string;
      passTypeId: string;
      serialNumber: string;
    }>;
  },
) {
  const { deviceId, passTypeId, serialNumber } = await params;

  const body = await request.json();
  const pushToken =
    typeof body?.pushToken === "string" ? body.pushToken.trim() : "";
  const authHeader = request.headers.get("authorization");
  const authToken = authHeader?.replace("ApplePass ", "") ?? "";

  if (!pushToken) {
    return NextResponse.json({ error: "Missing push token" }, { status: 400 });
  }

  if (passTypeId !== process.env.APPLE_PASS_TYPE_ID) {
    return NextResponse.json(
      { error: "Invalid pass type identifier" },
      { status: 400 },
    );
  }

  const [user] = await db
    .select({ qrToken: schema.users.qrToken })
    .from(schema.users)
    .where(eq(schema.users.rut, serialNumber));

  if (!user?.qrToken || authToken !== user.qrToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.insert(schema.walletRegistrations).values({
    userId: serialNumber,
    platform: "APPLE",
    serialNumber,
    deviceId,
    pushToken,
    authToken: user.qrToken,
  });

  return NextResponse.json(null, { status: 201 });
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      deviceId: string;
      passTypeId: string;
      serialNumber: string;
    }>;
  },
) {
  try {
    const { deviceId, passTypeId, serialNumber } = await context.params;
    if (passTypeId !== process.env.APPLE_PASS_TYPE_ID) {
      console.log("Invalid pass type identifier");
      return NextResponse.json(
        { error: "Invalid pass type identifier" },
        { status: 400 },
      );
    }
    await db
      .delete(schema.walletRegistrations)
      .where(
        and(
          eq(schema.walletRegistrations.deviceId, deviceId),
          eq(schema.walletRegistrations.serialNumber, serialNumber),
        ),
      );
    console.log(`🗑️ Registro eliminado para el serial: ${serialNumber}`);
    return NextResponse.json(null, { status: 200 });
  } catch (error) {
    console.error("Error eliminando el registro de wallet:", error);
    return NextResponse.json(
      { error: "Error eliminando el registro" },
      { status: 500 },
    );
  }
}
