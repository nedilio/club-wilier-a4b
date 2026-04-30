import { describe, expect, it } from "vitest";
import { generateApplePass } from "@/lib/wallet/apple";

describe("generateApplePass", () => {
  it("throws a clear error when the Apple private key is encrypted and the passphrase is missing", () => {
    expect(() =>
      generateApplePass(
        {
          firstName: "Juan",
          lastName: "Perez",
          rut: "12345678K",
          clubWilierNumber: "42",
          qrToken: "qr-token",
        },
        {
          wwdr: Buffer.from("wwdr"),
          signerCert: Buffer.from("signer-cert"),
          signerKey: Buffer.from(
            "-----BEGIN ENCRYPTED PRIVATE KEY-----\ntest\n-----END ENCRYPTED PRIVATE KEY-----",
          ),
          passTypeId: "pass.com.all4bikers.clubwilier",
          teamIdentifier: "TEAMID123",
        },
      ),
    ).toThrow(/APPLE_PRIVATE_KEY_PASSPHRASE/);
  });
});
