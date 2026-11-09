import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppBackground } from "@/components/layout/app-background";

const montserrat = Montserrat({
  variable: "--font-montserrat-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    template: "%s | Club All4Bikers",
    default: "Club All4Bikers",
  },
  description:
    "Club de ciclistas All4Bikers en Chile. Accede a tu tarjeta de socio digital.",
  icons: {
    icon: "/fav_A4B_32x32.webp",
  },
  openGraph: {
    title: "Club All4Bikers",
    description:
      "Club de ciclistas All4Bikers en Chile. Accede a tu tarjeta de socio digital.",
    type: "website",
    locale: "es_CL",
    siteName: "Club All4Bikers",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${montserrat.variable} ${geistMono.variable}`}>
      <body className="relative min-h-full flex flex-col antialiased bg-[#05070b] text-white">
        <AppBackground />
        {children}
      </body>
    </html>
  );
}
