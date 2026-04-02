"use client";

import Image from "next/image";
import { formatRut } from "@/lib/auth/rut";
import { BrandLogo } from "@/components/login/brand-logo";

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
    <div className="relative w-full aspect-[85.6/53.98] max-w-md">
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #121c2b 0%, #1e2f42 50%, #0f1620 100%)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative h-full p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <a
              href="https://www.all4bikers.cl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="-mx-2">
                <Image
                  src="/All4Bikers_Logo.png"
                  alt="All4Bikers"
                  width={180}
                  height={107}
                  className="object-contain w-auto h-16"
                  loading="eager"
                />
              </div>
            </a>
            {isMember && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-white/40">
                  Socio
                </p>
                <p className="text-lg font-bold tracking-wide text-white">
                  #{clubWilierNumber}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isMember && (
              <div className="size-16 shrink-0 rounded-full bg-white/10 flex items-center justify-center">
                <BrandLogo size="xs" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold tracking-wide text-white uppercase">
                {firstName} {lastName}
              </h2>
              <p className="text-sm text-white/50 font-mono">
                {formatRut(rut)}
              </p>
              {!isMember && (
                <p className="text-sm text-white/30 mt-1">
                  Solicita tu membresía en nuestra tienda
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-4 h-4">
                <span
                  className={`absolute inline-flex w-4 h-4 rounded-full animate-ping opacity-60 ${
                    isMember ? "bg-green-400" : "bg-red-400/50"
                  }`}
                />
                <span
                  className={`relative inline-flex w-2.5 h-2.5 rounded-full ${
                    isMember ? "bg-green-400" : "bg-red-400/60"
                  }`}
                />
              </div>
              <span className="text-xs text-white/40">
                {isMember ? "Activo" : "No es miembro"}
              </span>
            </div>
          </div>
        </div>

        {isMember && (
          <div
            className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, #e63946 0%, transparent 70%)",
            }}
          />
        )}
      </div>

      <div
        className="absolute -inset-1 rounded-3xl opacity-30 blur-xl -z-10"
        style={{
          background: "linear-gradient(135deg, #1e2f42, #121c2b)",
        }}
      />
    </div>
  );
}

export function MembershipCardPlaceholder() {
  return (
    <div className="relative w-full aspect-[85.6/53.98] max-w-md animate-pulse">
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, #121c2b 0%, #1e2f42 50%, #0f1620 100%)",
        }}
      />
    </div>
  );
}
