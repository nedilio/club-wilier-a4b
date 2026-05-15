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
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <Input
        type="text"
        name="notification"
        id="notification"
        placeholder="Mensaje de la notificacion"
        disabled={pending}
      />
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2Icon className="animate-spin" /> : "Enviar"}
      </Button>
      {state.error ? (
        <p aria-live="polite" className="text-sm text-red-500">
          {state.error}
        </p>
      ) : null}
      {state.success && state.message ? (
        <p aria-live="polite" className="text-sm text-green-600">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
