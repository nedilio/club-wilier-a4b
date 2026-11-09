"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { sendPushNotification } from "./actions";
import { initialSendPushNotificationState } from "./state";

export function NotificationsForm() {
  const [state, formAction, pending] = useActionState(
    sendPushNotification,
    initialSendPushNotificationState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza el contador con el reset del form
      setCount(0);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      <FieldGroup>
        <Field data-disabled={pending || undefined} data-invalid={!!state.error}>
          <div className="flex items-baseline justify-between gap-3">
            <FieldLabel
              htmlFor="notification"
              className="text-sm font-semibold text-white"
            >
              Mensaje
            </FieldLabel>
            <span aria-live="polite" className="text-xs text-white/50">
              {count} caracteres
            </span>
          </div>
          <textarea
            name="notification"
            id="notification"
            placeholder="Mensaje de la notificación"
            disabled={pending}
            aria-invalid={!!state.error}
            rows={4}
            onChange={(e) => setCount(e.target.value.length)}
            className="glass-field min-h-28 w-full resize-y rounded-2xl px-4 py-3 text-base text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-red-400/50"
          />
          <FieldDescription className="text-sm leading-6 text-white/55">
            Mantén el texto corto y directo para una mejor lectura en la
            tarjeta.
          </FieldDescription>
          <FieldError className="text-red-300">{state.error}</FieldError>
        </Field>
      </FieldGroup>
      <button
        type="submit"
        disabled={pending}
        className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-b from-[#d8d6e8] to-[#a3a0b8] text-base font-semibold tracking-wide text-[#14131a] shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_10px_30px_-12px_rgb(163_160_184/0.6)] transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/40 sm:h-14"
      >
        {pending ? (
          <Loader2Icon className="size-5 animate-spin" />
        ) : (
          <>
            Enviar notificación
            <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
      {state.success && state.message ? (
        <p aria-live="polite" className="text-sm text-emerald-300">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
