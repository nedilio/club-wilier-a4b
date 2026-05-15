import { db, schema } from "@/db";
import apn from "apn";
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

const bodySchema = z.object({
  message: z.string(),
});

type PushBodyErrors = z.inferFlattenedErrors<typeof bodySchema>;

export type ApplePushResult =
  | {
      success: true;
      environment: "production" | "sandbox";
      sentCount: number;
    }
  | {
      success: false;
      error: string;
      details?: PushBodyErrors;
      environment?: "production" | "sandbox";
      topic?: string;
      totalRequested?: number;
      failedCount?: number;
      errors?: unknown[];
      hint?: string;
      status: 400 | 500 | 502 | 503;
    };

function getPushConfig() {
  const key = process.env.APPLE_P8_CONTENTS;
  const keyId = process.env.APPLE_PUSH_KEY_ID;
  const teamId = process.env.APPLE_TEAM_IDENTIFIER;
  const topic = process.env.APPLE_PASS_TYPE_ID;

  if (!key || !keyId || !teamId || !topic) {
    return null;
  }

  return {
    key,
    keyId,
    teamId,
    topic,
    production: true,
  };
}

export async function sendAppleWalletPushNotification(
  body: unknown,
): Promise<ApplePushResult> {
  const parsedBody = bodySchema.safeParse(body);

  if (!parsedBody.success) {
    return {
      success: false,
      error: "Invalid request body",
      details: parsedBody.error.flatten(),
      status: 400,
    };
  }

  const config = getPushConfig();
  if (!config) {
    return {
      success: false,
      error:
        "Missing Apple push configuration. Set APPLE_P8_CONTENTS, APPLE_PUSH_KEY_ID, APPLE_TEAM_IDENTIFIER and APPLE_PASS_TYPE_ID.",
      status: 503,
    };
  }

  const environment = config.production ? "production" : "sandbox";
  const apnProvider = new apn.Provider({
    token: {
      key: config.key,
      keyId: config.keyId,
      teamId: config.teamId,
    },
    production: config.production,
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

    const allFailed = results.flatMap((result) => result.failed);
    const allSent = results.flatMap((result) => result.sent);

    if (allFailed.length > 0) {
      const reasons = allFailed
        .map((entry) => entry.response?.reason)
        .filter(Boolean);

      return {
        success: false,
        environment,
        topic: config.topic,
        totalRequested: pushTokens.length,
        failedCount: allFailed.length,
        errors: allFailed,
        hint: reasons.includes("BadEnvironmentKeyInToken")
          ? "APNs esta configurado solo para produccion. Revisa que los tokens registrados provengan del entorno de produccion."
          : undefined,
        error: "Error enviando notificaciones push",
        status: 502,
      };
    }

    return {
      success: true,
      environment,
      sentCount: allSent.length,
    };
  } catch (error) {
    console.error("Error enviando notificaciones push:", error);
    return {
      success: false,
      error: "Error enviando notificaciones push",
      status: 500,
    };
  } finally {
    apnProvider.shutdown();
  }
}
