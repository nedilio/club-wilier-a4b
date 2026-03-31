import { PKPass } from "passkit-generator";
import { formatRut } from "@/lib/auth/rut";

export interface ApplePassUser {
  firstName: string;
  lastName: string;
  rut: string;
  clubWilierNumber: string;
  qrToken: string | null;
}

export interface AppleCerts {
  wwdr: Buffer;
  signerCert: Buffer;
  signerKey: Buffer;
  passTypeId: string;
  teamIdentifier: string;
}

// Minimal 1×1 transparent PNG — replace with real brand assets when available
const STUB_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

export function generateApplePass(
  user: ApplePassUser,
  certs: AppleCerts,
): Buffer {
  const pass = new PKPass(
    {
      "icon.png": STUB_PNG,
      "icon@2x.png": STUB_PNG,
      "icon@3x.png": STUB_PNG,
      "logo.png": STUB_PNG,
      "logo@2x.png": STUB_PNG,
    },
    {
      wwdr: certs.wwdr,
      signerCert: certs.signerCert,
      signerKey: certs.signerKey,
    },
    {
      passTypeIdentifier: certs.passTypeId,
      teamIdentifier: certs.teamIdentifier,
      serialNumber: user.rut,
      organizationName: "Club Wilier",
      description: "Tarjeta de Socio Club Wilier",
      logoText: "CLUB WILIER",
      backgroundColor: "rgb(18, 28, 43)",
      foregroundColor: "rgb(255, 255, 255)",
      labelColor: "rgb(150, 160, 180)",
    },
  );

  pass.type = "generic";

  pass.headerFields.push({
    key: "member",
    label: "SOCIO",
    value: `#${user.clubWilierNumber}`,
  });

  pass.primaryFields.push({
    key: "name",
    label: "NOMBRE",
    value: `${user.firstName} ${user.lastName}`.toUpperCase(),
  });

  pass.secondaryFields.push({
    key: "rut",
    label: "RUT",
    value: formatRut(user.rut),
  });

  pass.backFields.push({
    key: "org",
    label: "Club",
    value: "All4Bikers Chile",
  });

  if (user.qrToken) {
    pass.setBarcodes({
      format: "PKBarcodeFormatQR",
      message: user.qrToken,
      messageEncoding: "iso-8859-1",
    });
  }

  return pass.getAsBuffer();
}
