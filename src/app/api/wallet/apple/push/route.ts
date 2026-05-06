import { db, schema } from "@/db";
import apn from "apn";
import { NextResponse } from "next/server";
import { z } from "zod";

interface AppleWalletNotification extends apn.Notification {
  pushType?:
    | "background"
    | "alert"
    | "voip"
    | "complication"
    | "fileprovider"
    | "mdm";
}

export const runtime = "nodejs";

const bodySchema = z.object({
  message: z.string(),
});

function parseProductionFlag(value: string | undefined) {
  if (!value) return false;

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function getPushConfig() {
  const key = process.env.APPLE_P8_CONTENTS;
  const keyId = process.env.APPLE_PUSH_KEY_ID;
  const teamId = process.env.APPLE_TEAM_IDENTIFIER;
  const topic = process.env.APPLE_PASS_TYPE_ID;
  const production = parseProductionFlag(process.env.APPLE_PUSH_PRODUCTION);

  if (!key || !keyId || !teamId || !topic) {
    return null;
  }

  return {
    key,
    keyId,
    teamId,
    topic,
    production,
  };
}

export async function POST(request: Request) {
  const body = await request.json();

  const parsedBody = bodySchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request body",
        details: parsedBody.error.flatten(),
      },
      { status: 400 },
    );
  }

  const config = getPushConfig();
  if (!config) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Missing Apple push configuration. Set APPLE_P8_CONTENTS, APPLE_PUSH_KEY_ID, APPLE_TEAM_IDENTIFIER and APPLE_PASS_TYPE_ID.",
      },
      { status: 503 },
    );
  }

  const apnProvider = new apn.Provider({
    token: {
      key: config.key,
      keyId: config.keyId,
      teamId: config.teamId,
    },
    production: true,
  });

  try {
    await db.insert(schema.notifications).values({
      message: parsedBody.data.message,
    });

    const notification = new apn.Notification() as AppleWalletNotification;
    notification.topic = config.topic;
    notification.payload = {
      aps: {
        "interruption-level": "active",
        sound: "default",
      },
    };
    notification.priority = 10;
    notification.pushType = "background";

    const pushTokens = await db.query.walletRegistrations.findMany({
      columns: {
        pushToken: true,
      },
      where: (walletRegistrations, { eq }) =>
        eq(walletRegistrations.platform, "APPLE"),
    });

    const results = await Promise.all(
      pushTokens.map((pushToken) =>
        apnProvider.send(notification, pushToken.pushToken),
      ),
    );

    const allFailed = results.flatMap((r) => r.failed);
    const allSent = results.flatMap((r) => r.sent);

    if (allFailed.length > 0) {
      // Extraemos las razones de los fallos
      const reasons = allFailed
        .map((entry) => entry.response?.reason)
        .filter(Boolean);

      return NextResponse.json(
        {
          success: false,
          environment: "production", //config.production ? "production" : "sandbox",
          topic: config.topic,
          totalRequested: pushTokens.length,
          failedCount: allFailed.length,
          errors: allFailed,
          hint: reasons.includes("BadEnvironmentKeyInToken")
            ? "El token pertenece al entorno opuesto. Revisa si el certificado es de producción o desarrollo."
            : undefined,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      environment: "production", //config.production ? "production" : "sandbox",
      sentCount: allSent.length,
    });
  } catch (error) {
    console.error("Error enviando notificaciones push:", error);
    return NextResponse.json(
      { success: false, error: "Error enviando notificaciones push" },
      { status: 500 },
    );
  } finally {
    apnProvider.shutdown();
  }
}
