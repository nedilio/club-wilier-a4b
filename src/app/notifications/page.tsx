import type { Metadata } from "next";
import { BellRingIcon, Clock3Icon, SendIcon } from "lucide-react";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { A4bIsoLogo } from "@/components/branding/a4b-iso-logo";
import { NotificationsForm } from "./notifications-form";

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

export default async function NotificationsPage() {
  const notifications = await db
    .select()
    .from(schema.notifications)
    .orderBy(desc(schema.notifications.sentAt));

  return (
    <main
      className="relative min-h-svh overflow-hidden px-4 py-10 sm:px-6"
      style={{
        background:
          "radial-gradient(circle at top, rgba(212, 175, 55, 0.18), transparent 30%), linear-gradient(135deg, #121c2b 0%, #1e2f42 50%, #121c2b 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/12 bg-white/8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-6 border-b border-white/10 p-8 text-white lg:border-r lg:border-b-0 lg:p-10">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 p-2">
                  <A4bIsoLogo size="sm" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.35em] text-(--color-accent-gold) uppercase">
                    Club All4Bikers
                  </p>
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Centro de notificaciones
                  </h1>
                </div>
              </div>

              <p className="max-w-xl text-sm leading-6 text-white/72 sm:text-base">
                Publica mensajes para las tarjetas digitales y revisa el
                historial reciente.
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                    Total
                  </p>
                  <p className="mt-3 text-3xl font-semibold">
                    {notifications.length}
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    mensajes registrados
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                    Estado
                  </p>
                  <p className="mt-3 text-lg font-semibold">
                    Listo para enviar
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    formulario operativo
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                    Último envío
                  </p>
                  <p className="mt-3 text-lg font-semibold">
                    {notifications[0]
                      ? formatNotificationDate(notifications[0].sentAt)
                      : "Sin envíos"}
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    actividad más reciente
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-10">
              <div className="rounded-[1.75rem] border border-(--color-accent-gold)/25 bg-white p-6 shadow-[0_18px_60px_rgba(18,28,43,0.18)]">
                <div className="mb-6 flex items-start gap-4">
                  <div className="rounded-2xl bg-(--color-wilier) p-3 text-white">
                    <SendIcon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.3em] uppercase">
                      Nuevo mensaje
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                      Enviar notificación push
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Escribe el mensaje que verán los socios en sus tarjetas
                      digitales.
                    </p>
                  </div>
                </div>
                <NotificationsForm />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/12 bg-black/15 p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.2)] backdrop-blur-md sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.32em] text-(--color-accent-gold) uppercase">
                Historial
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Notificaciones enviadas
              </h2>
            </div>
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 sm:flex sm:items-center sm:gap-2">
              <BellRingIcon className="size-4" />
              Registro en tiempo reciente
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/4 px-6 py-10 text-center">
              <p className="text-lg font-medium">Todavía no hay mensajes.</p>
              <p className="mt-2 text-sm text-white/55">
                El primer envío aparecerá aquí con su fecha y contenido.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {notifications.map((notification, index) => (
                <article
                  key={notification.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5 transition-colors hover:bg-white/9"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-(--color-accent-gold)">
                        <BellRingIcon className="size-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-white/70">
                            Mensaje {notifications.length - index}
                          </span>
                          <span className="rounded-full bg-green-950 px-2.5 py-1 text-xs font-medium text-green-500">
                            Enviado
                          </span>
                        </div>
                        <p className="mt-2 text-base leading-7 text-white/92">
                          {notification.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-white/55 sm:pl-6">
                      <Clock3Icon className="size-4" />
                      <time dateTime={notification.sentAt.toISOString()}>
                        {formatNotificationDate(notification.sentAt)}
                      </time>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
