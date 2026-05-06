import { db, schema } from "@/db";
import { generateApplePass } from "@/lib/wallet/apple";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getAppleCerts } from "../../../../route";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ passTypeId: string; serialNumber: string }> },
) {
  const { passTypeId, serialNumber } = await params;
  const authHeader = req.headers.get("authorization");

  if (passTypeId !== process.env.APPLE_PASS_TYPE_ID) {
    return NextResponse.json(
      { error: "Invalid pass type identifier" },
      { status: 404 },
    );
  }

  const [registration] = await db
    .select()
    .from(schema.walletRegistrations)
    .where(eq(schema.walletRegistrations.serialNumber, serialNumber));

  const requestToken = authHeader?.replace("ApplePass ", "");

  if (!registration || requestToken !== registration.authToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.rut, serialNumber));

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const certs = getAppleCerts();

  if (!certs) {
    return NextResponse.json(
      { error: "Servicio de wallet no configurado" },
      { status: 503 },
    );
  }
  const message = await db.query.notifications.findFirst({
    orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
  });

  const notificationMessage =
    message?.message ?? "Bienvenidos al club Wilier de All4Bikers";
  const lastModified = message?.createdAt ?? new Date();
  const ifModifiedSince = req.headers.get("if-modified-since");
  if (ifModifiedSince) {
    const lastModifiedDate = new Date(ifModifiedSince);
    if (lastModifiedDate >= lastModified) {
      return NextResponse.json({ error: "Not modified" }, { status: 304 });
    }
  }

  const passBuffer = await generateApplePass(
    {
      firstName: user.firstName,
      lastName: user.lastName,
      rut: user.rut,
      clubWilierNumber: user.clubWilierNumber!,
      qrToken: user.qrToken,
    },
    certs,
    notificationMessage,
  );

  return NextResponse.json(new Uint8Array(passBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Last-Modified":
        message?.createdAt.toUTCString() ?? new Date().toUTCString(),
    },
  });
}
