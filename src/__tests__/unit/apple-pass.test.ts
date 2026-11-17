import { describe, expect, it } from "vitest";
import {
  DEFAULT_PASS_BACKGROUND,
  MEMBERSHIP_BACKGROUNDS,
  getPassBackground,
  generateApplePass,
} from "@/lib/wallet/apple";

describe("getPassBackground", () => {
  it("uses the default background without a membership", () => {
    expect(getPassBackground(null)).toEqual(DEFAULT_PASS_BACKGROUND);
  });

  it("uses the default background for an unmapped membership", () => {
    expect(getPassBackground("Membresía desconocida")).toEqual(
      DEFAULT_PASS_BACKGROUND,
    );
  });

  it("uses the configured colors for the known memberships", () => {
    expect(getPassBackground("Wilier privilege club")).toEqual(
      DEFAULT_PASS_BACKGROUND,
    );
    expect(getPassBackground("Team black")).toEqual({
      image: "wallet/team-black.png",
      backgroundColor: "rgb(0, 0, 0)",
    });
  });

  it("uses the mapped background for a configured membership", () => {
    const name = "Membresía de prueba";
    MEMBERSHIP_BACKGROUNDS[name] = {
      image: "wallet/test.png",
      backgroundColor: "rgb(1, 2, 3)",
    };
    try {
      expect(getPassBackground(name)).toEqual({
        image: "wallet/test.png",
        backgroundColor: "rgb(1, 2, 3)",
      });
    } finally {
      delete MEMBERSHIP_BACKGROUNDS[name];
    }
  });
});

describe("generateApplePass", () => {
  it("throws a clear error when the Apple private key is encrypted and the passphrase is missing", () => {
    expect(() =>
      generateApplePass(
        {
          firstName: "Juan",
          lastName: "Perez",
          rut: "12345678K",
          clubWilierNumber: "42",
          membershipName: "Club Wilier",
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
