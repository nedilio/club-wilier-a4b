import { db, schema } from "@/db";
import { NotificationsForm } from "./notifications-form";

export default async function NotificationsPage() {
  const notifications = await db.select().from(schema.notifications);
  return (
    <>
      <div className="flex flex-col gap-4 min-h-screen items-center justify-center">
        <h1>Notificaciones</h1>
        <NotificationsForm />
        {notifications.map((notification) => (
          <p key={notification.id}>{notification.message}</p>
        ))}
      </div>
    </>
  );
}
