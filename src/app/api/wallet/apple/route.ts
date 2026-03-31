import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/jwt";
import { generateApplePass } from "@/lib/wallet/apple";

function getAppleCerts() {
  const passTypeId = process.env.APPLE_PASS_TYPE_ID;
  const teamIdentifier = process.env.APPLE_TEAM_IDENTIFIER;
  const wwdrBase64 = process.env.APPLE_WWDR_CERTIFICATE;
  const certBase64 = process.env.APPLE_CERTIFICATE;
  const keyBase64 = process.env.APPLE_PRIVATE_KEY;

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
    wwdr: Buffer.from(wwdrBase64, "base64"),
    signerCert: Buffer.from(certBase64, "base64"),
    signerKey: Buffer.from(keyBase64, "base64"),
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

    return new Response(passBuffer, {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": 'attachment; filename="club-wilier.pkpass"',
      },
    });
  } catch (error) {
    console.error("Apple Wallet error:", error);
    return NextResponse.json(
      { error: "Error al generar el pase" },
      { status: 500 },
    );
  }
}
