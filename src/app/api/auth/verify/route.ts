import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/db";
import { eq, and, isNull, gt } from "drizzle-orm";
import { verifyOtp } from "@/lib/auth/otp";
import { getClientByRut, getMembershipName } from "@/lib/auth/bsale";
import {
  createToken,
  setSessionCookie,
  hashToken,
  generateQrToken,
} from "@/lib/auth/jwt";
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

    if (!otpRecord.email) {
      return NextResponse.json(
        { success: false, error: "Email no encontrado en el registro" },
        { status: 400 },
      );
    }

    const now = new Date();
    const [localUser] = await db.select().from(schema.users)
      .where(eq(schema.users.rut, cleanedRut)).limit(1);
    let newUserValues: typeof schema.users.$inferInsert | undefined;
    if (!localUser) {
      const bsaleClient = await getClientByRut(cleanedRut);
      if (!bsaleClient) {
        return NextResponse.json(
          { success: false, error: "Cliente no encontrado" },
          { status: 404 },
        );
      }
      const { clientId, membershipName } = await getMembershipName(bsaleClient);
      const qrToken = clientId ? generateQrToken(cleanedRut) : null;

      newUserValues = {
        rut: cleanedRut,
        firstName: String(bsaleClient.firstName),
        lastName: String(bsaleClient.lastName),
        email: otpRecord.email,
        clubWilierNumber: clientId ?? null,
        membershipName: membershipName ?? null,
        qrToken,
        createdAt: now,
        updatedAt: now,
        lastSyncedAt: now,
      };
    }

    const token = await createToken({
      rut: cleanedRut,
      email: otpRecord.email,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.transaction(async (tx) => {
      if (newUserValues) {
        await tx.insert(schema.users).values(newUserValues)
          .onConflictDoUpdate({
            target: schema.users.rut,
            set: { email: otpRecord.email!, updatedAt: now },
          });
      } else {
        await tx.update(schema.users)
          .set({ email: otpRecord.email!, updatedAt: now })
          .where(eq(schema.users.rut, cleanedRut));
      }

      await tx
        .delete(schema.sessions)
        .where(eq(schema.sessions.userRut, cleanedRut));

      await tx.insert(schema.sessions).values({
        userRut: cleanedRut,
        tokenHash: hashToken(token),
        expiresAt,
        createdAt: now,
      });
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
