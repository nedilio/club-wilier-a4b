// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { WalletButtons } from "@/components/card/wallet-buttons";

afterEach(() => {
  vi.unstubAllGlobals();
});

function setUA(ua: string) {
  vi.stubGlobal("navigator", { ...navigator, userAgent: ua });
}

describe("WalletButtons", () => {
  describe("iOS user agent", () => {
    beforeEach(() => {
      setUA(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      );
    });

    it("shows Apple Wallet button", async () => {
      render(<WalletButtons />);
      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /apple wallet/i }),
        ).toBeInTheDocument();
      });
    });

    it("does not show Google Wallet button", async () => {
      render(<WalletButtons />);
      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /apple wallet/i }),
        ).toBeInTheDocument();
      });
      expect(
        screen.queryByRole("link", { name: /google wallet/i }),
      ).not.toBeInTheDocument();
    });

    it("Apple Wallet link points to /api/wallet/apple", async () => {
      render(<WalletButtons />);
      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /apple wallet/i }),
        ).toBeInTheDocument();
      });
      expect(
        screen.getByRole("link", { name: /apple wallet/i }),
      ).toHaveAttribute("href", "/api/wallet/apple");
    });
  });

  describe("Android user agent", () => {
    beforeEach(() => {
      setUA(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      );
    });

    it("shows Google Wallet button", async () => {
      render(<WalletButtons />);
      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /google wallet/i }),
        ).toBeInTheDocument();
      });
    });

    it("does not show Apple Wallet button", async () => {
      render(<WalletButtons />);
      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /google wallet/i }),
        ).toBeInTheDocument();
      });
      expect(
        screen.queryByRole("link", { name: /apple wallet/i }),
      ).not.toBeInTheDocument();
    });

    it("Google Wallet link points to /api/wallet/google", async () => {
      render(<WalletButtons />);
      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /google wallet/i }),
        ).toBeInTheDocument();
      });
      expect(
        screen.getByRole("link", { name: /google wallet/i }),
      ).toHaveAttribute("href", "/api/wallet/google");
    });
  });

  describe("macOS Safari user agent", () => {
    beforeEach(() => {
      setUA(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      );
    });

    it("shows Apple Wallet button", async () => {
      render(<WalletButtons />);
      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /apple wallet/i }),
        ).toBeInTheDocument();
      });
    });

    it("does not show Google Wallet button", async () => {
      render(<WalletButtons />);
      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /apple wallet/i }),
        ).toBeInTheDocument();
      });
      expect(
        screen.queryByRole("link", { name: /google wallet/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Desktop Chrome user agent", () => {
    beforeEach(() => {
      setUA(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      );
    });

    it("shows both wallet buttons", async () => {
      render(<WalletButtons />);
      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /apple wallet/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("link", { name: /google wallet/i }),
        ).toBeInTheDocument();
      });
    });
  });
});
