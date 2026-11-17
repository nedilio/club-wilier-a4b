import { PKPass } from "passkit-generator";
import { maskRut } from "@/lib/auth/rut";
import { A4B_ISO_LOGO_ASSET_PATH } from "@/lib/brand";
import { getImageBuffer } from "../server-utils";

export interface ApplePassUser {
  firstName: string;
  lastName: string;
  rut: string;
  clubWilierNumber: string;
  qrToken: string | null;
  membershipName: string | null;
}

export interface AppleCerts {
  wwdr: Buffer;
  signerCert: Buffer;
  signerKey: Buffer;
  signerKeyPassphrase?: string;
  passTypeId: string;
  teamIdentifier: string;
}

export interface PassBackground {
  /** Ruta relativa a `public/`. Si se omite, el pase usa solo `backgroundColor`. */
  image?: string;
  backgroundColor: string;
}

export const DEFAULT_PASS_BACKGROUND: PassBackground = {
  image: "background-pass.png",
  backgroundColor: "rgb(18, 28, 43)",
};

/**
 * Fondo del pase por nombre de membresía (texto exacto del atributo 29 de BSale,
 * guardado en `users.membershipName`). Las membresías sin entrada usan el fondo
 * por defecto.
 */
export const MEMBERSHIP_BACKGROUNDS: Record<string, PassBackground> = {
  "Wilier privilege club": DEFAULT_PASS_BACKGROUND,
  "Team black": {
    image: "wallet/team-black.png",
    backgroundColor: "rgb(0, 0, 0)",
  },
};

export function getPassBackground(membershipName: string | null): PassBackground {
  if (!membershipName) {
    return DEFAULT_PASS_BACKGROUND;
  }
  return MEMBERSHIP_BACKGROUNDS[membershipName] ?? DEFAULT_PASS_BACKGROUND;
}

function requiresPassphrase(signerKey: Buffer) {
  return signerKey.toString("utf-8").includes("BEGIN ENCRYPTED PRIVATE KEY");
}

export function generateApplePass(
  user: ApplePassUser,
  certs: AppleCerts,
  newMessage?: string,
): Buffer {
  if (requiresPassphrase(certs.signerKey) && !certs.signerKeyPassphrase) {
    throw new Error(
      "Apple private key is encrypted. Configure APPLE_PRIVATE_KEY_PASSPHRASE.",
    );
  }

  if (!user.qrToken) {
    throw new Error("User does not have a QR token.");
  }

  const background = getPassBackground(user.membershipName);

  const files: Record<string, Buffer> = {
    "icon.png": getImageBuffer(A4B_ISO_LOGO_ASSET_PATH),
    "icon@2x.png": getImageBuffer(A4B_ISO_LOGO_ASSET_PATH),
    "icon@3x.png": getImageBuffer(A4B_ISO_LOGO_ASSET_PATH),
    "logo.png": getImageBuffer("All4Bikers_Logo.png"),
    "logo@2x.png": getImageBuffer("All4Bikers_Logo.png"),
  };
  if (background.image) {
    const backgroundBuffer = getImageBuffer(background.image);
    files["background.png"] = backgroundBuffer;
    files["background@2x.png"] = backgroundBuffer;
  }

  const pass = new PKPass(
    files,
    {
      wwdr: certs.wwdr,
      signerCert: certs.signerCert,
      signerKey: certs.signerKey,
      signerKeyPassphrase: certs.signerKeyPassphrase,
    },
    {
      authenticationToken: user.qrToken!,
      passTypeIdentifier: certs.passTypeId,
      teamIdentifier: certs.teamIdentifier,
      serialNumber: user.rut,
      organizationName: "Club All4Bikers",
      description: "Tarjeta de Socio Club All4Bikers",
      webServiceURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/wallet/apple`,
      backgroundColor: background.backgroundColor,
      foregroundColor: "rgb(255, 255, 255)",
      labelColor: "rgb(150, 160, 180)",
      sharingProhibited: true,
    },
  );

  pass.type = "eventTicket";

  pass.headerFields.push({
    key: "member",
    label: "SOCIO",
    value: `#${user.clubWilierNumber}`,
  });

  pass.primaryFields.push({
    key: "club",
    label: "Club",
    value: user?.membershipName ?? "",
  });

  pass.secondaryFields.push({
    key: "name",
    label: "NOMBRE",
    value: `${user.firstName} ${user.lastName}`.toUpperCase(),
  });

  pass.auxiliaryFields.push({
    key: "rut",
    label: "RUT",
    value: maskRut(user.rut),
  });

  pass.backFields.push({
    key: "org",
    label: "Club",
    value: "All4Bikers Chile",
  });

  pass.backFields.push({
    key: "website",
    label: "All4bikers",
    value: "https://www.all4bikers.cl",
  });

  pass.backFields.push({
    key: "updates",
    label: "Última Información",
    value: newMessage ?? "Bienvenidos al club All4Bikers",
    changeMessage: "All4Bikers: %@",
  });

  if (user.qrToken) {
    pass.setBarcodes({
      format: "PKBarcodeFormatQR",
      message: `${process.env.NEXT_PUBLIC_APP_URL}/api/verify/${user.qrToken}`,
      messageEncoding: "iso-8859-1",
      altText: "All4bikers",
    });
  }

  return pass.getAsBuffer();
}
