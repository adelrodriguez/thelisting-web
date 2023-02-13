export const WHATSAPP_MESSAGE_TEMPLATES = {
  BabyShowerGuestNotification: "baby_shower_guest_notification",
  ListingGiftPurchase: "listing_gift_purchase",
  WeddingGuestNotification: "wedding_guest_notification",
} as const
export type WhatsAppMessageTemplate =
  (typeof WHATSAPP_MESSAGE_TEMPLATES)[keyof typeof WHATSAPP_MESSAGE_TEMPLATES]

export const MIME_TYPES = {
  csv: "text/csv",
  jpeg: "image/jpeg",
  png: "image/png",
} as const
export type FileType = (typeof MIME_TYPES)[keyof typeof MIME_TYPES]

export const CURRENCIES = {
  DOP: "DOP",
  USD: "USD",
} as const
export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES]

export const REDIS_KEYS = {
  Cart: "cart",
  ProductScraper: "scraper:product",
} as const
export type RedisKey = (typeof REDIS_KEYS)[keyof typeof REDIS_KEYS]

// Durations in seconds
export const ONE_DAY = 60 * 60 * 24
export const ONE_WEEK = ONE_DAY * 7

// Fees
export const PAYMENT_FEE = 0.055
export const SHIPPING_FEE = 300 // 300 DOP
export const SHIPPING_METHOD = "Gestión y Entrega"

// Public assets
export const THE_LISTING_LOGO_BLACK =
  "/assets/images/the-listing-logo-black.png"
export const THE_LISTING_LOGO_WHITE =
  "/assets/images/the-listing-logo-white.png"

// Shopify Custom Attributes
export const CUSTOM_ATTRIBUTES = {
  ListingId: "listing_id",
  ListingSku: "listing_sku",
  NoteId: "note_id",
  SessionCartsKey: "session_carts_key", // Used to identify the cart in Redis
} as const
export type CustomAttribute =
  (typeof CUSTOM_ATTRIBUTES)[keyof typeof CUSTOM_ATTRIBUTES]
