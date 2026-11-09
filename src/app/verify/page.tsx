import type { Metadata } from "next";
import Image from "next/image";
import {
  CheckIcon,
  IdCardIcon,
  InfoIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";
import { A4bIsoLogo } from "@/components/branding/a4b-iso-logo";
import { HeaderIconBox } from "@/components/branding/header-icon-box";
import { formatRut } from "@/lib/auth/rut";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Verificación",
  description: "Resultado de verificación para Club All4bikers.",
};

const eyebrowClass =
  "whitespace-nowrap text-[11px] font-semibold uppercase leading-none tracking-[0.35em] text-white/55";

function missingDataNote(hasRut: boolean, hasMembership: boolean) {
  if (!hasRut && !hasMembership)
    return "Este socio aún no tiene RUT ni membresía registrados.";
  if (!hasRut) return "Este socio aún no tiene RUT registrado.";
  if (!hasMembership) return "Este socio aún no tiene membresía registrada.";
  return null;
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ rut?: string; membership?: string }>;
}) {
  const { rut, membership } = await searchParams;
  const isMember = !!membership;
  const note = missingDataNote(!!rut, isMember);

  return (
    <main className="relative flex min-h-svh items-center justify-center px-4 py-8 sm:py-10">
      <div className="flex w-full max-w-4xl flex-col gap-5 text-white sm:gap-6">
        {/* Barra superior */}
        <div className="flex items-center justify-between gap-4 px-1">
          <Image
            src="/All4Bikers_Logo.png"
            alt="All4Bikers"
            width={180}
            height={107}
            priority
            className="h-8 w-auto sm:h-9"
          />
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/55 sm:text-xs">
            Verificación de socio
          </p>
        </div>

        <section className="glass w-full overflow-hidden rounded-[2rem]">
          <div className="grid gap-0 md:grid-cols-2">
            {/* Resultado */}
            <div className="border-b border-white/10 p-6 sm:p-8 md:border-r md:border-b-0 md:p-10">
              <div className="relative inline-flex">
                <div className="glass-field flex size-20 items-center justify-center rounded-2xl sm:size-22">
                  <A4bIsoLogo className="size-10 sm:size-11" />
                </div>
                <span
                  className={cn(
                    "absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full ring-4 ring-[#0d0f14]",
                    isMember
                      ? "bg-emerald-400 text-[#06200f] shadow-[0_0_20px_rgb(52_211_153/0.5)]"
                      : "bg-red-500 text-white shadow-[0_0_20px_rgb(239_68_68/0.5)]",
                  )}
                >
                  {isMember ? (
                    <CheckIcon className="size-4" strokeWidth={3} />
                  ) : (
                    <XIcon className="size-4" strokeWidth={3} />
                  )}
                </span>
              </div>

              <p className={cn(eyebrowClass, "mt-6")}>Club All 4 bikers</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {isMember ? "Verificación exitosa" : "Cliente no es miembro"}
              </h1>

              <p className="mt-4 max-w-sm text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                La validación del código fue completada correctamente. Los datos
                del socio quedan resumidos a continuación.
              </p>

              <div
                className={cn(
                  "mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
                  isMember
                    ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
                    : "border-red-400/25 bg-red-500/10 text-red-300",
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    isMember ? "bg-emerald-400" : "bg-red-500",
                  )}
                />
                {isMember ? "Cliente confirmado" : "Cliente no confirmado"}
              </div>
            </div>

            {/* Resumen */}
            <div className="p-6 sm:p-8 md:p-10">
              <div className="flex items-stretch gap-3 sm:gap-4">
                <HeaderIconBox className="rounded-xl bg-linear-to-b from-[#d8d6e8] to-[#a3a0b8] text-[#14131a] shadow-[inset_0_1px_0_rgb(255_255_255/0.6)]">
                  <ShieldCheckIcon className="size-5" />
                </HeaderIconBox>
                <div className="flex flex-col justify-between gap-2">
                  <p className={eyebrowClass}>Resumen</p>
                  <h2 className="text-xl font-semibold leading-none sm:text-2xl">
                    Datos verificados
                  </h2>
                </div>
              </div>

              <div className="glass-field mt-6 divide-y divide-white/10 rounded-2xl">
                <div className="p-5">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/55">
                    RUT
                  </p>
                  {rut ? (
                    <p className="mt-2 font-mono text-lg font-semibold sm:text-xl">
                      {formatRut(rut)}
                    </p>
                  ) : (
                    <p className="mt-2 flex items-center gap-3 font-mono text-lg text-white/70 sm:text-xl">
                      <span className="h-px w-5 bg-white/40" />
                      No informado
                    </p>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/55">
                    Membresía
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg border",
                        isMember
                          ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
                          : "border-red-400/25 bg-red-500/10 text-red-300",
                      )}
                    >
                      <IdCardIcon className="size-4" />
                    </div>
                    <p className="font-medium">
                      {membership || "Sin información"}
                    </p>
                  </div>
                </div>
              </div>

              {note && (
                <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-white/55 sm:text-sm">
                  <InfoIcon className="mt-0.5 size-4 shrink-0" />
                  {note}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
