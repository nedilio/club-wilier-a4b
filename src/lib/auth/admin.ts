import { and, eq, gt } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSessionCookie, hashToken, verifyToken } from "./jwt";

export const canSendNotifications = (email: string) => {
  const normalized = email.trim().toLowerCase();
  return (
    !!normalized &&
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .some((entry) => entry.trim().toLowerCase() === normalized)
  );
};

export type NotificationAuthorization =
  | { authorized: true }
  | { authorized: false; status: 401 | 403 | 503; error: string };

export async function authorizeNotifications(): Promise<NotificationAuthorization> {
  const unauthorized = {
    authorized: false,
    status: 401,
    error: "Tu sesión expiró",
  } as const;

  // Let Next.js handle cookies() request-time signals during prerendering.
  const token = await getSessionCookie();
  if (!token) return unauthorized;

  try {
    const session = await verifyToken(token);
    if (
      !session ||
      typeof session.rut !== "string" || !session.rut ||
      typeof session.email !== "string" || !session.email
    ) {
      return unauthorized;
    }

    const storedSession = await db.query.sessions.findFirst({
      columns: { id: true },
      where: and(
        eq(schema.sessions.userRut, session.rut),
        eq(schema.sessions.tokenHash, hashToken(token)),
        gt(schema.sessions.expiresAt, new Date()),
      ),
    });
    if (!storedSession) return unauthorized;

    if (!canSendNotifications(session.email)) {
      return {
        authorized: false,
        status: 403,
        error: "No tienes permisos para enviar notificaciones",
      };
    }

    return { authorized: true };
  } catch {
    console.error("No se pudo verificar la autorización de notificaciones");
    return {
      authorized: false,
      status: 503,
      error: "No se pudo verificar tu sesión. Inténtalo nuevamente.",
    };
  }
}
