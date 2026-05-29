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
        // <a
        //   href="/api/wallet/google"
        //   aria-label="Guardar en Google Wallet"
        //   className="block"

        // >
        <div className="flex flex-col items-center justify-center rounded-lg bg-linear-to-r from-gray-800 to-gray-700 px-4 py-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 220 62"
            width="220"
            height="62"
            className="h-12 w-auto"
            role="img"
            aria-label="Save to Google Wallet"
          >
            <rect
              width="220"
              height="62"
              rx="10"
              fill="#404040"
              stroke="white"
              strokeWidth="1"
              strokeOpacity="0.15"
            />
            <circle cx="32" cy="31" r="10" fill="none" />
            <text
              x="27"
              y="36"
              fill="white"
              fontSize="18"
              fontFamily="'Google Sans', Roboto, sans-serif"
              fontWeight="700"
            >
              G
            </text>
            <text
              x="52"
              y="26"
              fill="white"
              fontSize="10"
              fontFamily="'Google Sans', Roboto, sans-serif"
              fontWeight="400"
              letterSpacing="0.5"
            >
              Save to
            </text>
            <text
              x="52"
              y="42"
              fill="white"
              fontSize="16"
              fontFamily="'Google Sans', Roboto, sans-serif"
              fontWeight="600"
            >
              Google Wallet
            </text>
          </svg>
          <div className="text-white text-sm font-medium mt-2">
            En construcción
          </div>
        </div>
        // </a>
      )}
    </div>
  );
}
