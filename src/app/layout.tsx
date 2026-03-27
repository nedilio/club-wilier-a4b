import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Club Wilier",
    default: "Club Wilier",
  },
  description:
    "Club de ciclistas Wilier en Chile. Accede a tu tarjeta de socio digital.",
  icons: {
    icon: "/fav_A4B_32x32.webp",
  },
  openGraph: {
    title: "Club Wilier",
    description:
      "Club de ciclistas Wilier en Chile. Accede a tu tarjeta de socio digital.",
    type: "website",
    locale: "es_CL",
    siteName: "Club Wilier",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${montserrat.variable} ${geistMono.variable}`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
