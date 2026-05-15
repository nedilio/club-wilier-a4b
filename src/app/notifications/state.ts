export type SendPushNotificationState = {
  success: boolean;
  message: string;
  error: string;
};

export const initialSendPushNotificationState: SendPushNotificationState = {
  success: false,
  message: "",
  error: "",
};
