"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/login/brand-logo";
import { Loader2Icon } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
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

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, rut }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al solicitar código");
        return;
      }

      setMessage(data.message || "Código enviado");
      setStep("otp");
    } catch {
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
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1).toUpperCase();
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setRut(`${formattedBody}-${dv}`);
  };

  const handleBack = () => {
    setStep("credentials");
    setOtp("");
    setError("");
    setMessage("");
  };

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <div className="flex flex-col items-center text-center gap-3">
        <BrandLogo size="md" />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            CLUB WILIER
          </h1>
          <p className="text-sm text-white/60">Exclusivo para socios Wilier</p>
        </div>
      </div>

      {step === "credentials" ? (
        <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="tu@correo.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20"
            />
            <Input
              type="text"
              placeholder="RUT (ej: 12.345.678-9)"
              value={rut}
              onChange={(e) => handleRutChange(e.target.value)}
              maxLength={12}
              required
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20"
            />
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full font-semibold text-base tracking-wide transition-all duration-200
            hover:bg-white/10 hover:border-white/30"
            // style={{
            //   background: "linear-gradient(135deg, #e63946 0%, #c1121f 100%)",
            // }}
          >
            {loading ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              "Solicitar código"
            )}
          </Button>

          <p className="text-xs text-center text-white/40">
            Al hacer clic en continuar, aceptas nuestros{" "}
            <a href="#" className="text-white/60 hover:text-white underline">
              Términos de servicio
            </a>{" "}
            y{" "}
            <a href="#" className="text-white/60 hover:text-white underline">
              Política de privacidad
            </a>
            .
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <div className="space-y-3">
            <p className="text-sm text-white/60 text-center">
              Ingresa el código de 6 dígitos que enviamos a{" "}
              <span className="text-white font-medium">{email}</span>
            </p>
            <Input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              required
              className="h-14 text-center text-2xl tracking-[0.5em] font-mono bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/40 focus:ring-white/20"
            />
            {message && (
              <p className="text-sm text-green-400 text-center">{message}</p>
            )}
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="h-12 w-full font-semibold text-base tracking-wide transition-all duration-200 hover:bg-white/10 hover:border-white/30"
          >
            {loading ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              "Verificar y entrar"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            Cambiar RUT o correo
          </Button>
        </form>
      )}

      <div className="text-center">
        <p className="text-xs text-white/30">by All4Bikers Chile</p>
      </div>
    </div>
  );
}
