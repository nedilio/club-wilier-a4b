import apn from "apn";
import { NextRequest, NextResponse } from "next/server";
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
  pushToken: z.string().min(1, "pushToken is required"),
  production: z.boolean().optional(),
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

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
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

  const production = parsedBody.data.production ?? config.production;
  const apnProvider = new apn.Provider({
    token: {
      key: config.key,
      keyId: config.keyId,
      teamId: config.teamId,
    },
    production: true,
  });

  try {
    const notification = new apn.Notification() as AppleWalletNotification;
    notification.topic = config.topic;
    notification.payload = {};
    notification.priority = 10;
    notification.pushType = "background";

    const result = await apnProvider.send(
      notification,
      parsedBody.data.pushToken,
    );

    if (result.failed.length > 0) {
      const reasons = result.failed
        .map((entry) => entry.response?.reason)
        .filter(Boolean);

      return NextResponse.json(
        {
          success: false,
          environment: production ? "production" : "sandbox",
          topic: config.topic,
          error: result.failed,
          hint: reasons.includes("BadEnvironmentKeyInToken")
            ? "The pass token belongs to the opposite APNs environment. If this pass was created with development Wallet certificates, send with sandbox. If it was created with production certificates, send with production."
            : undefined,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      environment: production ? "production" : "sandbox",
      sent: result.sent,
    });
  } finally {
    apnProvider.shutdown();
  }
}
