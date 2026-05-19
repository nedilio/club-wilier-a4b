import type { Metadata } from "next";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Inicia Sesión",
  description: "Accede a tu tarjeta de socio del Club All4bikers.",
};

export default function LoginPage() {
  return <LoginClient />;
}
