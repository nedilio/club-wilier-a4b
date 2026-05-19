import { SignJWT } from "jose";
import { createPrivateKey } from "node:crypto";
import { formatRut } from "@/lib/auth/rut";

const GOOGLE_WALLET_SAVE_URL = "https://pay.google.com/gp/v/save";

export interface GoogleWalletUser {
  firstName: string;
  lastName: string;
  rut: string;
  clubWilierNumber: string;
  qrToken: string | null;
}

export interface GoogleCreds {
  issuerId: string;
  serviceAccountEmail: string;
  privateKeyPem: string;
}

export async function buildGoogleWalletUrl(
  user: GoogleWalletUser,
  creds: GoogleCreds,
): Promise<string> {
  const classId = `${creds.issuerId}.clubwilier_v1`;
  // Object ID must be alphanumeric and unique per user
  const safeRut = user.rut.replace(/[^a-zA-Z0-9]/g, "_");
  const objectId = `${creds.issuerId}.${safeRut}`;

  const loyaltyClass = {
    id: classId,
    issuerName: "All4bikers",
    programName: "club all4bikers",
    reviewStatus: "DRAFT",
  };

  const loyaltyObject: Record<string, unknown> = {
    id: objectId,
    classId,
    accountId: user.clubWilierNumber,
    accountName: `${user.firstName} ${user.lastName}`.toUpperCase(),
    state: "ACTIVE",
    textModulesData: [
      {
        id: "rut",
        header: "RUT",
        body: formatRut(user.rut),
      },
      {
        id: "member_number",
        header: "SOCIO",
        body: `#${user.clubWilierNumber}`,
      },
    ],
  };

  if (user.qrToken) {
    loyaltyObject.barcode = {
      type: "QR_CODE",
      value: user.qrToken,
    };
  }

  const privateKey = createPrivateKey(creds.privateKeyPem);

  const jwt = await new SignJWT({
    iss: creds.serviceAccountEmail,
    aud: "google",
    typ: "savetowallet",
    payload: {
      loyaltyClasses: [loyaltyClass],
      loyaltyObjects: [loyaltyObject],
    },
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .sign(privateKey);

  return `${GOOGLE_WALLET_SAVE_URL}/${jwt}`;
}
