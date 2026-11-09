"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MembershipCard } from "@/components/card/membership-card";
import { WalletButtons } from "@/components/card/wallet-buttons";
import { A4bIsoLogo } from "@/components/branding/a4b-iso-logo";
import { LogOutIcon } from "lucide-react";

interface User {
  rut: string;
  firstName: string;
  lastName: string;
  email: string;
  clubWilierNumber: string | null;
  membershipName: string | null;
}

interface CardViewProps {
  user: User;
  isAdmin: boolean;
}

export function CardView({ user, isAdmin }: CardViewProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const isMember = !!user.clubWilierNumber;

  return (
    <div className="min-h-svh w-full flex flex-col items-center justify-center px-4 py-10 sm:p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <A4bIsoLogo size="sm" />
          <h1 className="text-xl font-bold tracking-tight text-white">
            CLUB ALL4BIKERS
          </h1>
          <p className="text-sm text-white/50">Tu tarjeta de socio</p>
        </div>
        <MembershipCard
          firstName={user.firstName}
          lastName={user.lastName}
          rut={user.rut}
          clubWilierNumber={user.clubWilierNumber}
        />
        {isMember && <WalletButtons />}
        {isAdmin && (
          <Button
            variant="link"
            className="glass-field h-11 w-full rounded-2xl text-white/80 hover:text-white hover:bg-white/10 hover:no-underline"
            onClick={() => router.push("/notifications")}
          >
            Centro de notificaciones
          </Button>
        )}
        {!isMember && (
          <div className="glass w-full text-center px-5 py-4 rounded-2xl">
            <p className="text-sm text-white/60">No eres socio del Club aún.</p>
            <p className="text-xs text-white/40 mt-1">
              Solicita ser parte en nuestra tienda{" "}
            </p>
          </div>
        )}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="glass-field h-11 w-full rounded-2xl text-white/80 hover:text-white hover:bg-white/10"
        >
          <LogOutIcon className="mr-2 size-4" />
          Cerrar sesión
        </Button>
        <p className="text-xs text-white/30">by All4Bikers Chile</p>
      </div>
    </div>
  );
}
