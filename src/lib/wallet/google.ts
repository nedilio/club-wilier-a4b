import { SignJWT, importPKCS8 } from "jose";
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
  const classId = `${creds.issuerId}.club_wilier_membership`;
  // Object ID must be alphanumeric and unique per user
  const safeRut = user.rut.replace(/[^a-zA-Z0-9]/g, "_");
  const objectId = `${creds.issuerId}.${safeRut}`;

  const genericClass = {
    id: classId,
    issuerName: "Club Wilier",
    reviewStatus: "underReview",
  };

  const genericObject: Record<string, unknown> = {
    id: objectId,
    classId,
    genericType: "GENERIC_TYPE_UNSPECIFIED",
    hexBackgroundColor: "#121c2b",
    logo: {
      sourceUri: {
        uri: "https://www.all4bikers.cl/cdn/shop/files/logo_wilier_500_x_500-3_180x.png",
      },
    },
    cardTitle: {
      defaultValue: { language: "es", value: "Club Wilier" },
    },
    header: {
      defaultValue: {
        language: "es",
        value: `${user.firstName} ${user.lastName}`.toUpperCase(),
      },
    },
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

  // QR stub: populated automatically when qrToken is set in Phase QR
  if (user.qrToken) {
    genericObject.barcode = {
      type: "QR_CODE",
      value: user.qrToken,
    };
  }

  const privateKey = await importPKCS8(creds.privateKeyPem, "RS256");

  const jwt = await new SignJWT({
    iss: creds.serviceAccountEmail,
    aud: "google",
    typ: "savestowallet",
    payload: {
      genericClasses: [genericClass],
      genericObjects: [genericObject],
    },
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .sign(privateKey);

  return `${GOOGLE_WALLET_SAVE_URL}/${jwt}`;
}
