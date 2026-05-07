import { PKPass } from "passkit-generator";
import { maskRut } from "@/lib/auth/rut";
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

  const pass = new PKPass(
    {
      "icon.png": getImageBuffer("logos/a4b-iso.png"),
      "icon@2x.png": getImageBuffer("logos/a4b-iso.png"),
      "icon@3x.png": getImageBuffer("logos/a4b-iso.png"),
      "logo.png": getImageBuffer("All4Bikers_Logo.png"),
      "logo@2x.png": getImageBuffer("All4Bikers_Logo.png"),
      "background.png": getImageBuffer("background-pass.png"),
      "background@2x.png": getImageBuffer("background-pass.png"),
    },
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
      organizationName: "Club Wilier",
      description: "Tarjeta de Socio Club Wilier",
      webServiceURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/wallet/apple`,
      backgroundColor: "rgb(18, 28, 43)",
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
    value: newMessage ?? "Bienvenidos al club Wilier de All4Bikers",
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
