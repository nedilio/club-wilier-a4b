import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Club Wilier – Tu tarjeta de socio digital";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const [a4bLogoData, wilierLogoData] = await Promise.all([
    readFile(join(process.cwd(), "public/All4Bikers_Logo.png")),
    readFile(join(process.cwd(), "public/wilier.svg")),
  ]);

  const a4bLogoSrc = `data:image/png;base64,${a4bLogoData.toString("base64")}`;
  const wilierLogoSrc = `data:image/svg+xml;base64,${wilierLogoData.toString("base64")}`;

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
      {/* Logos row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "64px",
        }}
      >
        {/* All4Bikers logo */}
        <img
          src={a4bLogoSrc}
          alt="All4Bikers"
          width={140}
          height={140}
          style={{ objectFit: "contain" }}
        />

        {/* Divider */}
        <div
          style={{
            width: "2px",
            height: "80px",
            background: "rgba(255,255,255,0.2)",
          }}
        />

        {/* Wilier logo */}
        <img
          src={wilierLogoSrc}
          alt="Wilier"
          width={60}
          height={80}
          style={{ objectFit: "contain", filter: "invert(1)" }}
        />
      </div>

      {/* Title */}
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
          CLUB WILIER
        </span>
        <span
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "4px",
          }}
        >
          CHILE
        </span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
