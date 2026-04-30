import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/jwt";
import { generateApplePass } from "@/lib/wallet/apple";

function normalizePemFromBase64(base64Value: string, label: string) {
  const decoded = Buffer.from(base64Value, "base64");
  const decodedText = decoded.toString("utf-8");

  if (decodedText.includes("BEGIN")) {
    return decoded;
  }

  const lines = base64Value.match(/.{1,64}/g) ?? [];
  const pem = `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
  return Buffer.from(pem, "utf-8");
}

function getAppleCerts() {
  const passTypeId = process.env.APPLE_PASS_TYPE_ID;
  const teamIdentifier = process.env.APPLE_TEAM_IDENTIFIER;
  const wwdrBase64 = process.env.APPLE_WWDR_CERTIFICATE;
  const certBase64 = process.env.APPLE_CERTIFICATE;
  const keyBase64 = process.env.APPLE_PRIVATE_KEY;
  const signerKeyPassphrase = process.env.APPLE_PRIVATE_KEY_PASSPHRASE;

  if (
    !passTypeId ||
    !teamIdentifier ||
    !wwdrBase64 ||
    !certBase64 ||
    !keyBase64
  ) {
    return null;
  }

  return {
    passTypeId,
    teamIdentifier,
    wwdr: normalizePemFromBase64(wwdrBase64, "CERTIFICATE"),
    signerCert: normalizePemFromBase64(certBase64, "CERTIFICATE"),
    signerKey: Buffer.from(keyBase64, "base64"),
    signerKeyPassphrase,
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

  const certs = getAppleCerts();
  if (!certs) {
    return NextResponse.json(
      { error: "Servicio de wallet no configurado" },
      { status: 503 },
    );
  }

  try {
    const passBuffer = generateApplePass(
      {
        firstName: user.firstName,
        lastName: user.lastName,
        rut: user.rut,
        clubWilierNumber: user.clubWilierNumber,
        qrToken: user.qrToken,
      },
      certs,
    );

    return new NextResponse(new Uint8Array(passBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": 'attachment; filename="club-wilier.pkpass"',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Apple Wallet error:", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error("Apple Wallet error:", error);
    }

    return NextResponse.json(
      { error: "Error al generar el pase" },
      { status: 500 },
    );
  }
}
