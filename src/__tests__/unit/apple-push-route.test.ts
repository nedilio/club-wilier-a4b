import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/admin", () => ({ authorizeNotifications: vi.fn() }));
vi.mock("@/app/api/wallet/apple/push/push", () => ({ sendAppleWalletPushNotification: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { authorizeNotifications } from "@/lib/auth/admin";
import { sendAppleWalletPushNotification } from "@/app/api/wallet/apple/push/push";
import { POST } from "@/app/api/wallet/apple/push/route";
import { sendPushNotification } from "@/app/notifications/actions";
import { initialSendPushNotificationState } from "@/app/notifications/state";
import { revalidatePath } from "next/cache";

function request(body = JSON.stringify({ message: "Hola socios" })) {
  return new Request("http://localhost/api/wallet/apple/push", {
    method: "POST", body, headers: { "Content-Type": "application/json" },
  });
}

function form(message = "Hola socios") {
  const data = new FormData();
  data.set("notification", message);
  return data;
}

describe("notification entry points", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeNotifications).mockResolvedValue({ authorized: true });
    vi.mocked(sendAppleWalletPushNotification).mockResolvedValue({
      success: true, environment: "production", sentCount: 2,
    });
  });

  it.each([401, 403, 503] as const)("rejects both entry points with authorization status %s", async (status) => {
    vi.mocked(authorizeNotifications).mockResolvedValue({ authorized: false, status, error: "Acceso rechazado" });
    const req = request("invalid JSON");
    const readBody = vi.spyOn(req, "json");
    const data = form();
    const readForm = vi.spyOn(data, "get");
    const response = await POST(req);
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ success: false, error: "Acceso rechazado" });
    expect(await sendPushNotification(initialSendPushNotificationState, data)).toEqual({
      success: false, message: "", error: "Acceso rechazado",
    });
    expect(readBody).not.toHaveBeenCalled();
    expect(readForm).not.toHaveBeenCalled();
    expect(sendAppleWalletPushNotification).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("allows an administrator to send through the API", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, environment: "production", sentCount: 2 });
    expect(sendAppleWalletPushNotification).toHaveBeenCalledWith({ message: "Hola socios" });
  });

  it("allows an administrator to send through the action", async () => {
    const result = await sendPushNotification(initialSendPushNotificationState, form(" Hola socios "));
    expect(result).toEqual({ success: true, message: "Notificacion enviada a 2 dispositivo(s).", error: "" });
    expect(sendAppleWalletPushNotification).toHaveBeenCalledWith({ message: "Hola socios" });
    expect(revalidatePath).toHaveBeenCalledWith("/notifications");
  });

  it("rejects malformed JSON after authorizing", async () => {
    expect((await POST(request("invalid"))).status).toBe(400);
    expect(sendAppleWalletPushNotification).not.toHaveBeenCalled();
  });

  it("rejects empty form messages", async () => {
    expect((await sendPushNotification(initialSendPushNotificationState, form(" "))).success).toBe(false);
    expect(sendAppleWalletPushNotification).not.toHaveBeenCalled();
  });

  it("preserves service failures without revalidating the page", async () => {
    vi.mocked(sendAppleWalletPushNotification).mockResolvedValue({ success: false, status: 502, error: "Fallo de APNs" });
    expect((await POST(request())).status).toBe(502);
    expect(await sendPushNotification(initialSendPushNotificationState, form())).toEqual({ success: false, message: "", error: "Fallo de APNs" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
