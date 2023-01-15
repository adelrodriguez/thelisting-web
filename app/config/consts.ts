export const WHATSAPP_MESSAGE_TEMPLATES = {
  BabyShowerGuestNotification: "baby_shower_guest_notification",
  WeddingGuestNotification: "wedding_guest_notification",
} as const
export type WhatsAppMessageTemplate =
  typeof WHATSAPP_MESSAGE_TEMPLATES[keyof typeof WHATSAPP_MESSAGE_TEMPLATES]

export const MIME_TYPES = {
  csv: "text/csv",
  jpeg: "image/jpeg",
  png: "image/png",
} as const
export type FileType = typeof MIME_TYPES[keyof typeof MIME_TYPES]

export const CURRENCIES = {
  dop: "DOP",
  usd: "USD",
} as const
export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES]

export const REDIS_KEYS = {
  productScraper: "scraper:product",
} as const
export type RedisKey = typeof REDIS_KEYS[keyof typeof REDIS_KEYS]

// Durations in seconds
export const ONE_DAY = 60 * 60 * 24
