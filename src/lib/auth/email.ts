import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Club Wilier <onboarding@resend.dev>";

interface SendOtpEmailParams {
  to: string;
  name: string;
  otp: string;
}

export async function sendOtpEmail({
  to,
  name,
  otp,
}: SendOtpEmailParams): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1a1a1a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0;">CLUB WILIER</h1>
      </div>
      <div style="padding: 24px; background-color: #f9f9f9;">
        <p style="font-size: 16px; color: #333;">
          Hola ${name},
        </p>
        <p style="font-size: 16px; color: #333;">
          Tu código de verificación es:
        </p>
        <div style="background-color: #ffffff; border: 2px dashed #ccc; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #666;">
          Este código expira en 5 minutos.
        </p>
        <p style="font-size: 14px; color: #666;">
          Si no solicitaste este código, puedes ignorar este email.
        </p>
      </div>
      <div style="padding: 16px; text-align: center; background-color: #eee; font-size: 12px; color: #666;">
        Club Wilier - Chile
      </div>
    </div>
  `;

  const text = `
    Hola ${name},

    Tu código de verificación es: ${otp}

    Este código expira en 5 minutos.

    Si no solicitaste este código, puedes ignorar este email.

    Club Wilier - Chile
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Tu código de acceso - Club Wilier",
    text,
    html,
  });
}
