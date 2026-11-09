"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { A4bIsoLogo } from "@/components/branding/a4b-iso-logo";
import { Loader2Icon } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [rut, setRut] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, rut }),
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al solicitar código");
        return;
      }

      setMessage(data.message || "Código enviado");
      setStep("otp");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rut, code: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Código inválido");
        return;
      }

      router.push("/card");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleRutChange = (value: string) => {
    const cleaned = value.replace(/[^0-9kK]/g, "");
    if (cleaned.length < 2) {
      setRut(cleaned);
      return;
    }
    const lastChar = cleaned.slice(-1);
    const isDv = /[0-9kK]/.test(lastChar);
    const dv = isDv ? lastChar.toUpperCase() : "";
    const bodyPart = isDv ? cleaned.slice(0, -1) : cleaned;
    const body = bodyPart.replace(/\D/g, "").slice(-8);
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setRut(`${formattedBody}-${dv}`);
  };

  const handleBack = () => {
    abortControllerRef.current?.abort();
    setStep("credentials");
    setOtp("");
    setError("");
    setMessage("");
    setLoading(false);
  };

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <div className="flex flex-col items-center text-center gap-3">
        <A4bIsoLogo size="xs" />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            CLUB All4Bikers
          </h1>
          <p className="text-sm text-white/70">Exclusivo para socios</p>
        </div>
      </div>

      {step === "credentials" ? (
        <form
          key="credentials"
          onSubmit={handleRequestOtp}
          className="flex flex-col gap-4"
        >
          <div className="space-y-2">
            <input
              type="email"
              aria-label="Correo electrónico"
              autoComplete="email"
              placeholder="tu@correo.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={fieldClass}
            />
            <input
              type="text"
              aria-label="RUT"
              autoComplete="off"
              placeholder="RUT (ej: 12.345.678-9)"
              value={rut}
              onChange={(e) => handleRutChange(e.target.value)}
              maxLength={12}
              required
              className={fieldClass}
            />
          </div>

          {error && <p className="text-sm text-red-300 text-center">{error}</p>}

          <button type="submit" disabled={loading} className={submitClass}>
            {loading ? (
              <Loader2Icon className="size-5 animate-spin" />
            ) : (
              "Solicitar código"
            )}
          </button>

          <p className="text-xs text-center text-white/50">
            Al hacer clic en continuar, aceptas nuestros{" "}
            <a href="#" className="text-white/70 hover:text-white underline">
              Términos de servicio
            </a>{" "}
            y{" "}
            <a href="#" className="text-white/70 hover:text-white underline">
              Política de privacidad
            </a>
            .
          </p>
        </form>
      ) : (
        <form
          key="otp"
          onSubmit={handleVerifyOtp}
          className="flex flex-col gap-4"
        >
          <div className="space-y-3">
            <p className="text-sm text-white/70 text-center">
              Ingresa el código de 6 dígitos que enviamos a{" "}
              <span className="text-white font-medium">{email}</span>
            </p>
            <input
              type="text"
              aria-label="Código de verificación"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              required
              className={cn(
                fieldClass,
                "h-14 text-center text-2xl tracking-[0.5em] font-mono placeholder:text-white/30",
              )}
            />
            {message && (
              <p className="text-sm text-emerald-300 text-center">{message}</p>
            )}
            {error && (
              <p className="text-sm text-red-300 text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={submitClass}
          >
            {loading ? (
              <Loader2Icon className="size-5 animate-spin" />
            ) : (
              "Verificar y entrar"
            )}
          </button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            className="h-11 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
          >
            Cambiar RUT o correo
          </Button>
        </form>
      )}

      <div className="text-center">
        <p className="text-xs text-white/40">by All4Bikers Chile</p>
      </div>
    </div>
  );
}

const fieldClass =
  "glass-field h-12 w-full rounded-xl px-4 text-base text-white placeholder:text-white/45 outline-none";

const submitClass =
  "flex h-12 w-full items-center justify-center rounded-xl bg-linear-to-b from-[#d8d6e8] to-[#a3a0b8] text-base font-semibold tracking-wide text-[#14131a] shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_10px_30px_-12px_rgb(163_160_184/0.6)] transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/40";
