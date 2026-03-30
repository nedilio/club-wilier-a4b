import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendOtpEmail } from "@/lib/auth/email";

const mockEmailsSend = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ id: "test-id" }),
);

vi.mock("resend", () => ({
  // Must use a regular function (not arrow) so it can be called with `new`
  Resend: vi.fn(function (this: Record<string, unknown>) {
    this.emails = { send: mockEmailsSend };
  }),
}));

describe("sendOtpEmail", () => {
  beforeEach(() => {
    mockEmailsSend.mockClear();
  });

  it("calls resend.emails.send with correct to and subject", async () => {
    await sendOtpEmail({ to: "user@test.com", name: "Carlos", otp: "123456" });

    expect(mockEmailsSend).toHaveBeenCalledOnce();
    const [args] = mockEmailsSend.mock.calls;
    expect(args[0].to).toBe("user@test.com");
    expect(args[0].subject).toBe("Tu código de acceso - Club Wilier");
  });

  it("includes the OTP code in the html body", async () => {
    await sendOtpEmail({ to: "user@test.com", name: "Carlos", otp: "987654" });

    const [args] = mockEmailsSend.mock.calls;
    expect(args[0].html).toContain("987654");
  });

  it("includes the OTP code in the text body", async () => {
    await sendOtpEmail({ to: "user@test.com", name: "Carlos", otp: "555555" });

    const [args] = mockEmailsSend.mock.calls;
    expect(args[0].text).toContain("555555");
  });

  it("personalises the email with the recipient's name", async () => {
    await sendOtpEmail({ to: "user@test.com", name: "Sofía", otp: "111111" });

    const [args] = mockEmailsSend.mock.calls;
    expect(args[0].html).toContain("Sofía");
    expect(args[0].text).toContain("Sofía");
  });
});
