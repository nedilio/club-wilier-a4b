"use server";

import { revalidatePath } from "next/cache";
import { sendAppleWalletPushNotification } from "../api/wallet/apple/push/push";
import { type SendPushNotificationState } from "./state";

export async function sendPushNotification(
  _prevState: SendPushNotificationState,
  formData: FormData,
): Promise<SendPushNotificationState> {
  const notificationMessage = formData.get("notification");
  const message =
    typeof notificationMessage === "string" ? notificationMessage.trim() : "";

  if (!message) {
    return {
      success: false,
      message: "",
      error: "Ingresa un mensaje para enviar la notificacion.",
    };
  }

  const result = await sendAppleWalletPushNotification({ message });

  if (!result.success) {
    return {
      success: false,
      message: "",
      error: result.hint ?? result.error,
    };
  }

  revalidatePath("/notifications");

  return {
    success: true,
    message: `Notificacion enviada a ${result.sentCount} dispositivo(s).`,
    error: "",
  };
}
