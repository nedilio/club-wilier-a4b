import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();
const shutdownMock = vi.fn();

vi.mock("apn", () => {
  class MockProvider {
    send = sendMock;
    shutdown = shutdownMock;
  }

  class MockNotification {
    topic?: string;
    payload?: Record<string, never>;
  }

  return {
    default: {
      Provider: MockProvider,
      Notification: MockNotification,
    },
  };
});

import { POST } from "@/app/api/wallet/apple/push/route";

describe("POST /api/wallet/apple/push", () => {
  beforeEach(() => {
    process.env.APPLE_P8_CONTENTS = "test-key";
    process.env.APPLE_PUSH_KEY_ID = "KEY123";
    process.env.APPLE_TEAM_IDENTIFIER = "TEAM123";
    process.env.APPLE_PASS_TYPE_ID = "pass.cl.all4bikers";
    delete process.env.APPLE_PUSH_PRODUCTION;

    sendMock.mockReset();
    shutdownMock.mockReset();
  });

  afterEach(() => {
    delete process.env.APPLE_P8_CONTENTS;
    delete process.env.APPLE_PUSH_KEY_ID;
    delete process.env.APPLE_TEAM_IDENTIFIER;
    delete process.env.APPLE_PASS_TYPE_ID;
    delete process.env.APPLE_PUSH_PRODUCTION;
  });

  it("returns a hint when APNs reports an environment mismatch", async () => {
    sendMock.mockResolvedValue({
      sent: [],
      failed: [
        {
          device: "push-token",
          status: "403",
          response: { reason: "BadEnvironmentKeyInToken" },
        },
      ],
    });

    const response = await POST(
      new Request("http://localhost/api/wallet/apple/push", {
        method: "POST",
        body: JSON.stringify({ pushToken: "push-token" }),
        headers: { "Content-Type": "application/json" },
      }) as never,
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      environment: "sandbox",
      hint: expect.stringMatching(/opposite APNs environment/i),
    });
    expect(shutdownMock).toHaveBeenCalled();
  });

  it("uses production when requested in the body", async () => {
    sendMock.mockResolvedValue({
      sent: [{ device: "push-token" }],
      failed: [],
    });

    const response = await POST(
      new Request("http://localhost/api/wallet/apple/push", {
        method: "POST",
        body: JSON.stringify({ pushToken: "push-token", production: true }),
        headers: { "Content-Type": "application/json" },
      }) as never,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      environment: "production",
      sent: [{ device: "push-token" }],
    });
  });
});
