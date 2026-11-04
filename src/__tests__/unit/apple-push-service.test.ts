import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  send: vi.fn(), shutdown: vi.fn(), provider: vi.fn(), insert: vi.fn(),
  values: vi.fn(), devices: vi.fn(),
}));
vi.mock("@/db", async () => ({
  schema: await import("@/db/schema"),
  db: { insert: mocks.insert, query: { walletRegistrations: { findMany: mocks.devices } } },
}));
vi.mock("apn", () => ({ default: {
  Provider: class {
    constructor(config: unknown) { mocks.provider(config); }
    send = mocks.send;
    shutdown = mocks.shutdown;
  },
  Notification: class {},
} }));

import { sendAppleWalletPushNotification } from "@/app/api/wallet/apple/push/push";

describe("Apple push service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("APPLE_P8_CONTENTS", "test-key");
    vi.stubEnv("APPLE_PUSH_KEY_ID", "KEY123");
    vi.stubEnv("APPLE_TEAM_IDENTIFIER", "TEAM123");
    vi.stubEnv("APPLE_PASS_TYPE_ID", "pass.cl.all4bikers");
    mocks.insert.mockReturnValue({ values: mocks.values });
    mocks.values.mockResolvedValue(undefined);
    mocks.devices.mockResolvedValue([{ pushToken: "device-token" }]);
  });
  afterEach(() => { vi.unstubAllEnvs(); });

  it("validates the message before touching the database or APNs", async () => {
    expect(await sendAppleWalletPushNotification({ pushToken: "old-body" })).toMatchObject({ success: false, status: 400 });
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.provider).not.toHaveBeenCalled();
  });

  it("sends to registered devices in production and closes the provider", async () => {
    mocks.send.mockResolvedValue({ sent: [{ device: "device-token" }], failed: [] });
    expect(await sendAppleWalletPushNotification({ message: "Hola" })).toEqual({
      success: true, environment: "production", sentCount: 1,
    });
    expect(mocks.values).toHaveBeenCalledWith({ message: "Hola" });
    expect(mocks.provider).toHaveBeenCalledWith(expect.objectContaining({ production: true }));
    expect(mocks.send).toHaveBeenCalledWith(expect.anything(), "device-token");
    expect(mocks.shutdown).toHaveBeenCalledOnce();
  });

  it("returns the current environment mismatch hint and closes the provider", async () => {
    mocks.send.mockResolvedValue({ sent: [], failed: [{ response: { reason: "BadEnvironmentKeyInToken" } }] });
    expect(await sendAppleWalletPushNotification({ message: "Hola" })).toMatchObject({
      success: false, status: 502, environment: "production", failedCount: 1,
      hint: expect.stringContaining("produccion"),
    });
    expect(mocks.shutdown).toHaveBeenCalledOnce();
  });
});
