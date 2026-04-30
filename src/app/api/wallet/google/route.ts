import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/jwt";
import { buildGoogleWalletUrl } from "@/lib/wallet/google";

function getGoogleCreds() {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const serviceAccountEmail = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
  const privateKeyBase64 =
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!issuerId || !serviceAccountEmail || !privateKeyBase64) {
    return null;
  }

  return {
    issuerId,
    serviceAccountEmail,
    privateKeyPem: Buffer.from(privateKeyBase64, "base64").toString("utf-8"),
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [user] = await db
    .select({
      rut: schema.users.rut,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      clubWilierNumber: schema.users.clubWilierNumber,
      qrToken: schema.users.qrToken,
    })
    .from(schema.users)
    .where(eq(schema.users.rut, session.rut));

  if (!user?.clubWilierNumber) {
    return NextResponse.json(
      { error: "Acceso restringido a socios" },
      { status: 403 },
    );
  }

  const creds = getGoogleCreds();
  if (!creds) {
    return NextResponse.json(
      { error: "Servicio de wallet no configurado" },
      { status: 503 },
    );
  }

  try {
    const url = await buildGoogleWalletUrl(
      {
        firstName: user.firstName,
        lastName: user.lastName,
        rut: user.rut,
        clubWilierNumber: user.clubWilierNumber,
        qrToken: user.qrToken,
      },
      creds,
    );

    return NextResponse.redirect(url, 302);
  } catch (error) {
    console.error("Google Wallet error:", error);
    return NextResponse.json(
      { error: "Error al generar el pase" },
      { status: 500 },
    );
  }
}
