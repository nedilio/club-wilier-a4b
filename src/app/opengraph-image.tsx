import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Club All4Bikers – Tu tarjeta de socio digital";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const a4bLogoData = await readFile(
    join(process.cwd(), "public/All4Bikers_Logo.png"),
  );

  const a4bLogoSrc = `data:image/png;base64,${a4bLogoData.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        background:
          "linear-gradient(135deg, #121c2b 0%, #1e2f42 50%, #121c2b 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "48px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={a4bLogoSrc}
          alt="All4Bikers"
          width={220}
          height={132}
          style={{ objectFit: "contain" }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-1px",
            lineHeight: 1,
          }}
        >
          CLUB ALL4BIKERS
        </span>
        <span
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "4px",
          }}
        >
          TU TARJETA DE SOCIO DIGITAL
        </span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
