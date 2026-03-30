// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "@/components/login-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("LoginForm", () => {
  describe("credentials step", () => {
    it("renders email and RUT input fields", () => {
      render(<LoginForm />);
      expect(screen.getByPlaceholderText(/tu@correo/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/RUT/i)).toBeInTheDocument();
    });

    it("calls /api/auth/request-otp on submit with valid data", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: "Código enviado" }),
      } as Response);

      render(<LoginForm />);

      fireEvent.change(screen.getByPlaceholderText(/tu@correo/i), {
        target: { value: "test@test.com" },
      });
      fireEvent.change(screen.getByPlaceholderText(/RUT/i), {
        target: { value: "12.345.678-9" },
      });
      fireEvent.click(screen.getByRole("button", { name: /solicitar/i }));

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(
          "/api/auth/request-otp",
          expect.objectContaining({ method: "POST" }),
        );
      });

      fetchSpy.mockRestore();
    });

    it("shows an error message when the API returns an error", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: false,
        json: async () => ({ error: "RUT no encontrado" }),
      } as Response);

      render(<LoginForm />);

      fireEvent.change(screen.getByPlaceholderText(/tu@correo/i), {
        target: { value: "test@test.com" },
      });
      fireEvent.change(screen.getByPlaceholderText(/RUT/i), {
        target: { value: "12.345.678-9" },
      });
      fireEvent.click(screen.getByRole("button", { name: /solicitar/i }));

      await waitFor(() => {
        expect(screen.getByText(/RUT no encontrado/i)).toBeInTheDocument();
      });
    });

    it("transitions to OTP step after successful request", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: "Código enviado" }),
      } as Response);

      render(<LoginForm />);

      fireEvent.change(screen.getByPlaceholderText(/tu@correo/i), {
        target: { value: "test@test.com" },
      });
      fireEvent.change(screen.getByPlaceholderText(/RUT/i), {
        target: { value: "12.345.678-9" },
      });
      fireEvent.click(screen.getByRole("button", { name: /solicitar/i }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText("000000")).toBeInTheDocument();
      });
    });
  });

  describe("OTP step", () => {
    async function renderAtOtpStep() {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "Código enviado" }),
      } as Response);

      render(<LoginForm />);

      fireEvent.change(screen.getByPlaceholderText(/tu@correo/i), {
        target: { value: "test@test.com" },
      });
      fireEvent.change(screen.getByPlaceholderText(/RUT/i), {
        target: { value: "12.345.678-9" },
      });
      fireEvent.click(screen.getByRole("button", { name: /solicitar/i }));

      await waitFor(() => screen.getByPlaceholderText("000000"));
    }

    it("calls /api/auth/verify on OTP submit", async () => {
      await renderAtOtpStep();

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      fireEvent.change(screen.getByPlaceholderText("000000"), {
        target: { value: "123456" },
      });
      fireEvent.click(screen.getByRole("button", { name: /verificar/i }));

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(
          "/api/auth/verify",
          expect.objectContaining({ method: "POST" }),
        );
      });
    });

    it("shows error when OTP is incorrect", async () => {
      await renderAtOtpStep();

      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Código inválido" }),
      } as Response);

      fireEvent.change(screen.getByPlaceholderText("000000"), {
        target: { value: "000000" },
      });
      fireEvent.click(screen.getByRole("button", { name: /verificar/i }));

      await waitFor(() => {
        expect(screen.getByText(/código inválido/i)).toBeInTheDocument();
      });
    });
  });
});
