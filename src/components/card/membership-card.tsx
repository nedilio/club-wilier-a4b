"use client";

import Image from "next/image";
import { A4bIsoLogo } from "@/components/branding/a4b-iso-logo";
import { formatRut } from "@/lib/auth/rut";
import { cn } from "@/lib/utils";

interface MembershipCardProps {
  firstName: string;
  lastName: string;
  rut: string;
  clubWilierNumber: string | null;
}

export function MembershipCard({
  firstName,
  lastName,
  rut,
  clubWilierNumber,
}: MembershipCardProps) {
  const isMember = !!clubWilierNumber;

  return (
    <div
      className="relative w-full max-w-md aspect-[85.6/53.98] overflow-hidden rounded-2xl border border-white/10"
      style={{
        background:
          "linear-gradient(160deg, #0a0b0e 0%, #07080b 45%, #0e1320 75%, #1a2338 100%)",
        boxShadow:
          "inset 0 1px 0 rgb(255 255 255 / 0.15), 0 30px 60px -15px rgb(0 0 0 / 0.8)",
      }}
    >
      {/* Luz diagonal superior izquierda */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 -top-1/4 h-1/2 w-[120%] -rotate-[30deg] rounded-full blur-2xl"
        style={{
          background:
            "linear-gradient(90deg, rgb(255 255 255 / 0.1) 0%, rgb(255 255 255 / 0.04) 40%, transparent 75%)",
        }}
      />
      {/* Resplandor azul/lavanda inferior derecho */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 100% 100%, rgba(150,160,200,0.55) 0%, rgba(70,90,140,0.35) 35%, transparent 65%)",
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between">
            <a
              href="https://www.all4bikers.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="-ml-1"
            >
              <Image
                src="/All4Bikers_Logo.png"
                alt="All4Bikers"
                width={180}
                height={107}
                className="h-11 w-auto object-contain sm:h-14"
                loading="eager"
              />
            </a>
            {isMember && (
              <p className="pt-1 text-[10px] uppercase tracking-[0.35em] text-white/50">
                Socio
              </p>
            )}
          </div>
          <div className="mt-2 h-px bg-white/10 sm:mt-3" />
        </div>

        {/* Nombre */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 sm:size-14">
            <A4bIsoLogo size="xs" className="size-6 sm:size-8" />
          </div>
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-lg font-semibold uppercase leading-tight text-white sm:text-2xl">
              {firstName} {lastName}
            </h2>
            {!isMember && (
              <p className="mt-0.5 text-xs text-white/50 sm:text-sm">
                Solicita tu membresía en nuestra tienda
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div>
          <div className="mb-2 h-px bg-white/10 sm:mb-3" />
          <div className="flex items-end justify-between gap-3">
            <p className="text-4xl font-light leading-none tracking-tight text-white sm:text-5xl">
              {isMember ? `#${clubWilierNumber}` : ""}
            </p>
            <div className="flex flex-col items-end gap-1.5 sm:gap-2">
              <p className="font-mono text-xs text-white/80 sm:text-sm">
                {formatRut(rut)}
              </p>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
                  isMember
                    ? "border-white/10 bg-white/10 text-white"
                    : "border-red-400/20 bg-red-500/10 text-red-200",
                )}
              >
                <span className="relative flex size-2">
                  <span
                    className={cn(
                      "absolute inline-flex size-full animate-ping rounded-full opacity-60",
                      isMember ? "bg-emerald-400" : "bg-red-500",
                    )}
                  />
                  <span
                    className={cn(
                      "relative inline-flex size-2 rounded-full",
                      isMember ? "bg-emerald-400" : "bg-red-500",
                    )}
                  />
                </span>
                {isMember ? "Activo" : "No es miembro"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
