"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
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
      <FieldGroup>
        <Field data-disabled={pending || undefined} data-invalid={!!state.error}>
          <FieldLabel
            htmlFor="notification"
            className="text-sm font-medium text-slate-800"
          >
            Mensaje
          </FieldLabel>
          <FieldDescription className="text-sm leading-6 text-slate-500">
            Mantén el texto corto y directo para una mejor lectura en la
            tarjeta.
          </FieldDescription>
          <Textarea
            name="notification"
            id="notification"
            placeholder="Mensaje de la notificación"
            disabled={pending}
            aria-invalid={!!state.error}
            rows={3}
            className="rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 placeholder:text-slate-400 focus-visible:border-[var(--color-accent-gold)] focus-visible:ring-[var(--color-accent-gold)]/25"
          />
          <FieldError className="text-[var(--color-accent-red)]">
            {state.error}
          </FieldError>
        </Field>
      </FieldGroup>
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
      {state.success && state.message ? (
        <p aria-live="polite" className="text-sm text-emerald-600">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
