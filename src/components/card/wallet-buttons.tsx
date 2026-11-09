"use client";

import { useEffect, useState } from "react";
import AddToAppleSVG from "./add-to-apple-svg";

type Platform = "apple" | "google" | "both" | null;

async function detectPlatform(): Promise<Platform> {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "apple";
  if (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua))
    return "apple";
  if (/Android/.test(ua)) return "google";
  return "both";
}

export function WalletButtons() {
  const [platform, setPlatform] = useState<Platform>(null);

  useEffect(() => {
    async function getPlatform() {
      const platform = await detectPlatform();
      setPlatform(platform);
    }
    getPlatform();
  }, []);

  // Renders null on server and before mount — prevents hydration mismatch
  if (platform === null) return null;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {(platform === "apple" || platform === "both") && (
        <a
          href="/api/wallet/apple"
          aria-label="Agregar a Apple Wallet"
          className="block"
        >
          <AddToAppleSVG className="h-12 w-auto" />
        </a>
      )}

      {(platform === "google" || platform === "both") && (
        // Deshabilitado hasta habilitar /api/wallet/google
        <div className="flex flex-col items-center gap-2">
          <div aria-disabled="true" className="pointer-events-none opacity-50">
            {/* Badge oficial de Google: no modificar (brand guidelines) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/wallet/google-wallet-badge-es419.svg"
              alt="Agregar a la Billetera de Google"
              width={239}
              height={55}
              className="h-12 w-auto"
            />
          </div>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
            En construcción
          </span>
        </div>
      )}
    </div>
  );
}
