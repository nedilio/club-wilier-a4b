const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(", ");

export const canSendNotifications = (email: string) => {
  const canSendNotifications = ADMIN_EMAILS?.includes(email || "");
  return !!canSendNotifications;
};
