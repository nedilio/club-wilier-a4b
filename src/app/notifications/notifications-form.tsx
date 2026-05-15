"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendPushNotification } from "./actions";
import { initialSendPushNotificationState } from "./state";

export function NotificationsForm() {
  const [state, formAction, pending] = useActionState(
    sendPushNotification,
    initialSendPushNotificationState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="space-y-2">
        <label
          htmlFor="notification"
          className="text-sm font-medium text-slate-800"
        >
          Mensaje
        </label>
        <p className="text-sm leading-6 text-slate-500">
          Mantén el texto corto y directo para una mejor lectura en la tarjeta.
        </p>
      </div>
      <Input
        type="text"
        name="notification"
        id="notification"
        placeholder="Mensaje de la notificación"
        disabled={pending}
        className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-slate-950 placeholder:text-slate-400 focus-visible:border-[var(--color-accent-gold)] focus-visible:ring-[var(--color-accent-gold)]/25"
      />
      <Button
        type="submit"
        disabled={pending}
        className="h-12 rounded-2xl bg-[var(--color-wilier)] text-white hover:bg-[var(--color-wilier-light)]"
      >
        {pending ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          "Enviar notificación"
        )}
      </Button>
      {state.error ? (
        <p aria-live="polite" className="text-sm text-[var(--color-accent-red)]">
          {state.error}
        </p>
      ) : null}
      {state.success && state.message ? (
        <p aria-live="polite" className="text-sm text-emerald-600">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
