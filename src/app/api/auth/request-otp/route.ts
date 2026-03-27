import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/db";
import { eq, and, isNull } from "drizzle-orm";
import { validateRut, cleanRut } from "@/lib/auth/rut";
import { generateOtp, hashOtp, getOtpExpiration } from "@/lib/auth/otp";
import { getClientByRut } from "@/lib/auth/bsale";
import { sendOtpEmail } from "@/lib/auth/email";

const requestSchema = z.object({
  email: z.string().email("Email inválido"),
  rut: z.string().min(8, "RUT inválido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = requestSchema.safeParse(body);
    console.log({ body, result });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, rut } = result.data;

    const cleanedRut = cleanRut(rut);
    if (!validateRut(cleanedRut)) {
      return NextResponse.json(
        { success: false, error: "RUT inválido" },
        { status: 400 },
      );
    }

    const bsaleClient = await getClientByRut(cleanedRut);

    if (!bsaleClient) {
      return NextResponse.json(
        { success: false, error: "RUT no encontrado" },
        { status: 404 }
      );
    }

    await db
      .delete(schema.otpCodes)
      .where(
        and(
          eq(schema.otpCodes.rut, cleanedRut),
          isNull(schema.otpCodes.usedAt),
        ),
      );

    const otp = generateOtp();
    const codeHash = hashOtp(otp);
    const expiresAt = new Date(getOtpExpiration(5));
    const now = new Date();

    await db.insert(schema.otpCodes).values({
      rut: cleanedRut,
      email: email.toLowerCase().trim(),
      codeHash,
      expiresAt,
      createdAt: now,
    });

    const fullName = `${bsaleClient.firstName} ${bsaleClient.lastName}`.trim();

    try {
      await sendOtpEmail({
        to: email,
        name: fullName || "Cliente",
        otp,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      return NextResponse.json(
        { success: false, error: "Error al enviar el email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Código enviado",
    });
  } catch (error) {
    console.error("Request OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
