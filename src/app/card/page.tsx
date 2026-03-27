import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/jwt";
import { CardView } from "@/components/card/card-view";

const getCardUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  const [user] = await db
    .select({
      rut: schema.users.rut,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      email: schema.users.email,
      clubWilierNumber: schema.users.clubWilierNumber,
    })
    .from(schema.users)
    .where(eq(schema.users.rut, session.rut));

  return user ?? null;
});

export async function generateMetadata(): Promise<Metadata> {
  const user = await getCardUser();
  if (!user) {
    return { title: "Mi Tarjeta" };
  }
  return {
    title: `${user.firstName} ${user.lastName}`,
    description: `Tarjeta de socio Club Wilier de ${user.firstName} ${user.lastName}.`,
  };
}

export default async function CardPage() {
  const user = await getCardUser();

  if (!user) {
    redirect("/login");
  }

  return <CardView user={user} />;
}
