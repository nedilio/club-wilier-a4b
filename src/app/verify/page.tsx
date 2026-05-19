import type { Metadata } from "next";
import { CheckCircle2Icon, IdCardIcon, ShieldCheckIcon } from "lucide-react";
import { A4bIsoLogo } from "@/components/branding/a4b-iso-logo";

export const metadata: Metadata = {
  title: "Verificación",
  description: "Resultado de verificación para Club All4bikers.",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ rut?: string; membership?: string }>;
}) {
  const { rut, membership } = await searchParams;
  const isMember = !!membership;

  return (
    <main
      className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-10"
      style={{
        background:
          "radial-gradient(circle at top, rgba(230, 57, 70, 0.16), transparent 28%), radial-gradient(circle at bottom right, rgba(212, 175, 55, 0.18), transparent 24%), linear-gradient(135deg, #121c2b 0%, #1e2f42 50%, #121c2b 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <section className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/12 bg-white/8 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="grid gap-0 md:grid-cols-[0.92fr_1.08fr]">
          <div className="border-b border-white/10 p-8 text-white md:border-r md:border-b-0 md:p-10">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
                <A4bIsoLogo size="sm" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.32em] text-(--color-accent-gold) uppercase">
                  Club All 4 bikers
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  Verificación exitosa
                </h1>
              </div>
            </div>

            <p className="mt-6 max-w-sm text-sm leading-6 text-white/70">
              La validación del código fue completada correctamente. Los datos
              del socio quedan resumidos a continuación.
            </p>

            <div className="mt-8 rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2Icon className="mt-0.5 size-5 text-emerald-300" />
                <div>
                  <p className="font-medium text-emerald-100">
                    Cliente confirmado
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-(--color-wilier) p-3 text-white">
                <ShieldCheckIcon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.28em] text-(--color-accent-red) uppercase">
                  Resumen
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                  Datos verificados
                </h2>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                  RUT
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {rut || "No informado"}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                  Membresía
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div
                    className={
                      isMember
                        ? "rounded-full bg-emerald-100 p-2 text-emerald-700"
                        : "rounded-full bg-amber-100 p-2 text-amber-700"
                    }
                  >
                    <IdCardIcon className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">
                      {membership || "Sin información"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
