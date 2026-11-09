import type { Metadata } from "next";
import Image from "next/image";
import { Clock3Icon, SendIcon } from "lucide-react";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { A4bIsoLogo } from "@/components/branding/a4b-iso-logo";
import { HeaderIconBox } from "@/components/branding/header-icon-box";
import { NotificationsForm } from "./notifications-form";
import {
  NotificationsHistory,
  type NotificationHistoryItem,
} from "./notifications-history";
import { redirect } from "next/navigation";
import { authorizeNotifications } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Notificaciones",
  description: "Envio y seguimiento de notificaciones para Club all4bikers.",
};

function formatNotificationDate(date: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(date);
}

// Formato del historial: 19-05-2026, 5:50 p. m.
function formatHistoryDate(date: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Santiago",
  }).format(date);
}

const eyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.35em] text-white/55";

export default async function NotificationsPage() {
  const authorization = await authorizeNotifications();

  if (!authorization.authorized) {
    if (authorization.status === 503) throw new Error(authorization.error);
    redirect(authorization.status === 401 ? "/login" : "/card");
  }

  const notifications = await db
    .select()
    .from(schema.notifications)
    .orderBy(desc(schema.notifications.sentAt));

  const latest = notifications[0];
  const historyItems: NotificationHistoryItem[] = notifications.map(
    (notification, index) => ({
      id: notification.id,
      label: `Mensaje ${notifications.length - index}`,
      message: notification.message,
      sentAtIso: notification.sentAt.toISOString(),
      sentAtLabel: formatHistoryDate(notification.sentAt),
    }),
  );

  return (
    <main className="relative min-h-svh px-4 py-8 sm:px-6 lg:py-12">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 text-white">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          {/* El cuadro del isotipo toma el alto exacto del bloque de texto */}
          <div className="flex items-stretch gap-3 sm:gap-4">
            <HeaderIconBox className="glass-field rounded-xl p-2 sm:p-2.5">
              <A4bIsoLogo className="size-full" />
            </HeaderIconBox>
            <div className="flex flex-col justify-between gap-2">
              <p className={`${eyebrowClass} leading-none`}>Club All4Bikers</p>
              <h1 className="text-2xl font-semibold leading-none tracking-tight sm:text-4xl">
                Centro de notificaciones
              </h1>
            </div>
          </div>
          <div className="glass-field hidden items-center gap-3 rounded-xl px-4 py-2 sm:flex">
            <Image
              src="/All4Bikers_Logo.png"
              alt="All4Bikers"
              width={180}
              height={107}
              className="h-7 w-auto"
            />
            <span className="h-5 w-px bg-white/15" />
            <span className="text-sm text-white/70">Panel admin</span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          {/* Resumen */}
          <section className="glass flex flex-col gap-6 rounded-[2rem] p-6 sm:p-8">
            <p className="max-w-xl text-sm leading-6 text-white/70 sm:text-base">
              Publica mensajes para las tarjetas digitales y revisa el
              historial reciente.
            </p>
            <div className="h-px bg-white/10" />

            <div className="grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="pb-4 sm:pr-6 sm:pb-0">
                <p className="text-sm text-white/60">Total</p>
                <p className="mt-2 text-4xl font-light leading-none sm:text-5xl">
                  {notifications.length}
                </p>
                <p className="mt-2 text-xs text-white/45">
                  mensajes registrados
                </p>
              </div>
              <div className="py-4 sm:px-6 sm:py-0">
                <p className="text-sm text-white/60">Estado</p>
                <p className="mt-2 flex items-center gap-2 text-xl font-medium">
                  <span className="size-2 shrink-0 rounded-full bg-emerald-400" />
                  Listo para enviar
                </p>
                <p className="mt-2 text-xs text-white/45">
                  formulario operativo
                </p>
              </div>
              <div className="pt-4 sm:pl-6 sm:pt-0">
                <p className="text-sm text-white/60">Último envío</p>
                <p className="mt-2 text-xl font-medium">
                  {latest ? formatNotificationDate(latest.sentAt) : "Sin envíos"}
                </p>
                <p className="mt-2 text-xs text-white/45">
                  actividad más reciente
                </p>
              </div>
            </div>

            {latest && (
              <div className="glass-field mt-auto flex flex-col gap-1 rounded-2xl px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
                <p className={`${eyebrowClass} shrink-0`}>Último mensaje</p>
                <p className="min-w-0 text-base text-white sm:truncate">
                  {latest.message}
                </p>
              </div>
            )}
          </section>

          {/* Formulario */}
          <section className="glass rounded-[2rem] p-6 sm:p-8">
            <div className="mb-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-b from-[#d8d6e8] to-[#a3a0b8] text-[#14131a] shadow-[inset_0_1px_0_rgb(255_255_255/0.6)]">
                  <SendIcon className="size-5" />
                </div>
                <h2 className="text-xl font-semibold leading-tight sm:text-2xl">
                  Enviar notificación push
                </h2>
              </div>
              <p className="text-sm leading-6 text-white/65 sm:text-base">
                Escribe el mensaje que verán los socios en sus tarjetas
                digitales.
              </p>
            </div>
            <NotificationsForm />
          </section>
        </div>

        {/* Historial */}
        <section className="glass rounded-[2rem] p-6 sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className={eyebrowClass}>Historial</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Notificaciones enviadas
              </h2>
            </div>
            <div className="glass-field hidden items-center gap-2 rounded-full px-4 py-2 text-sm text-white/65 sm:flex">
              <Clock3Icon className="size-4" />
              Más recientes primero
            </div>
          </div>

          {historyItems.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.04] px-6 py-10 text-center">
              <p className="text-lg font-medium">Todavía no hay mensajes.</p>
              <p className="mt-2 text-sm text-white/55">
                El primer envío aparecerá aquí con su fecha y contenido.
              </p>
            </div>
          ) : (
            <NotificationsHistory items={historyItems} />
          )}
        </section>
      </div>
    </main>
  );
}
