import { NextResponse } from "next/server";
import { sendAppleWalletPushNotification } from "./push";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await sendAppleWalletPushNotification(body);

  if (!result.success) {
    return NextResponse.json(result, { status: result.status });
  }

  return NextResponse.json(result);
}
