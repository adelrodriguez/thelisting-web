export const WhatsAppMessageTemplate = {
  BabyShowerGuestNotification: "baby_shower_guest_notification",
  WeddingGuestNotification: "wedding_guest_notification",
} as const
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type WhatsAppMessageTemplate =
  typeof WhatsAppMessageTemplate[keyof typeof WhatsAppMessageTemplate]
