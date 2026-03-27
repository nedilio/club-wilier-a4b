"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MembershipCard } from "@/components/card/membership-card";
import { BrandLogo } from "@/components/login/brand-logo";
import { LogOutIcon } from "lucide-react";

interface User {
  rut: string;
  firstName: string;
  lastName: string;
  email: string;
  clubWilierNumber: string | null;
}

interface CardViewProps {
  user: User;
}

export function CardView({ user }: CardViewProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const isMember = !!user.clubWilierNumber;

  return (
    <div
      className="min-h-svh w-full flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #121c2b 0%, #1e2f42 50%, #121c2b 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <BrandLogo size="sm" />
          <h1 className="text-xl font-bold tracking-tight text-white">
            CLUB WILIER
          </h1>
          <p className="text-sm text-white/50">Tu tarjeta de socio</p>
        </div>

        <MembershipCard
          firstName={user.firstName}
          lastName={user.lastName}
          rut={user.rut}
          clubWilierNumber={user.clubWilierNumber}
        />

        {!isMember && (
          <div className="text-center px-4 py-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-white/60">
              No eres socio del Club Wilier aún.
            </p>
            <p className="text-xs text-white/40 mt-1">
              Solicita ser parte en nuestra tienda{" "}
            </p>
          </div>
        )}

        <Button
          onClick={handleLogout}
          variant="default"
          className="border-white/20 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30"
        >
          <LogOutIcon className="mr-2 size-4" />
          Cerrar sesión
        </Button>

        <p className="text-xs text-white/30">by All4Bikers Chile</p>
      </div>
    </div>
  );
}
