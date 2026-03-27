import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/db";
import { eq, and, isNull, gt } from "drizzle-orm";
import { verifyOtp } from "@/lib/auth/otp";
import { getClientByRut, extractClubWilierNumber } from "@/lib/auth/bsale";
import { createToken, setSessionCookie, hashToken } from "@/lib/auth/jwt";
import { createHash } from "crypto";
import { cleanRut } from "@/lib/auth/rut";

const verifySchema = z.object({
  rut: z.string().min(8, "RUT requerido"),
  code: z.string().length(6, "Código debe tener 6 dígitos"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { rut, code } = result.data;
    const cleanedRut = cleanRut(rut);

    const otpRecords = await db
      .select()
      .from(schema.otpCodes)
      .where(
        and(
          eq(schema.otpCodes.rut, cleanedRut),
          isNull(schema.otpCodes.usedAt),
          gt(schema.otpCodes.expiresAt, new Date()),
        ),
      )
      .orderBy(schema.otpCodes.createdAt);

    const otpRecord = otpRecords[otpRecords.length - 1];

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: "Código inválido o expirado" },
        { status: 400 },
      );
    }

    if (!verifyOtp(code, otpRecord.codeHash)) {
      return NextResponse.json(
        { success: false, error: "Código inválido" },
        { status: 400 },
      );
    }

    await db
      .update(schema.otpCodes)
      .set({ usedAt: new Date() })
      .where(eq(schema.otpCodes.id, otpRecord.id));

    const bsaleClient = await getClientByRut(cleanedRut);

    if (!bsaleClient) {
      return NextResponse.json(
        { success: false, error: "Cliente no encontrado" },
        { status: 404 },
      );
    }

    const now = new Date();
    const clubWilierNumber = extractClubWilierNumber(bsaleClient);
    const qrToken = clubWilierNumber
      ? createHash("sha256")
          .update(cleanedRut + process.env.JWT_SECRET)
          .digest("hex")
      : null;

    await db
      .insert(schema.users)
      .values({
        rut: cleanedRut,
        firstName: bsaleClient.firstName,
        lastName: bsaleClient.lastName,
        email: otpRecord.email,
        clubWilierNumber,
        qrToken,
        createdAt: now,
        updatedAt: now,
        lastSyncedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.users.rut,
        set: {
          firstName: bsaleClient.firstName,
          lastName: bsaleClient.lastName,
          email: otpRecord.email,
          clubWilierNumber,
          qrToken,
          updatedAt: now,
          lastSyncedAt: now,
        },
      });

    const token = await createToken({
      rut: cleanedRut,
      email: otpRecord.email,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(schema.sessions).values({
      userRut: cleanedRut,
      tokenHash: hashToken(token),
      expiresAt,
      createdAt: now,
    });

    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
