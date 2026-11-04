import { NextResponse } from "next/server";
import { sendAppleWalletPushNotification } from "./push";
import { authorizeNotifications } from "@/lib/auth/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authorization = await authorizeNotifications();
  if (!authorization.authorized) {
    return NextResponse.json(
      { success: false, error: authorization.error },
      { status: authorization.status },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "JSON inválido" },
      { status: 400 },
    );
  }
  const result = await sendAppleWalletPushNotification(body);

  if (!result.success) {
    return NextResponse.json(result, { status: result.status });
  }

  return NextResponse.json(result);
}
