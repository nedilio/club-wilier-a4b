import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

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
    return new Response("Missing push token", { status: 400 });
  }

  if (passTypeId !== process.env.APPLE_PASS_TYPE_ID) {
    return new Response("Invalid pass type identifier", { status: 400 });
  }

  const [user] = await db
    .select({ qrToken: schema.users.qrToken })
    .from(schema.users)
    .where(eq(schema.users.rut, serialNumber));

  if (!user?.qrToken || authToken !== user.qrToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  await db.insert(schema.walletRegistrations).values({
    userId: serialNumber,
    platform: "APPLE",
    serialNumber,
    deviceId,
    pushToken,
    authToken: user.qrToken,
  });

  return new Response(null, { status: 201 });
}
