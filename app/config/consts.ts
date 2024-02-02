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
  Currency: "currency",
  GoogleFonts: "google-fonts",
  ProductScraper: "scraper:product",
  ShopifyProduct: "shopify:product",
} as const
export type RedisKey = (typeof REDIS_KEYS)[keyof typeof REDIS_KEYS]

export const ONE_SECOND = {
  inMilliseconds: 1000,
  inSeconds: 1,
}
export const ONE_MINUTE = {
  inMilliseconds: ONE_SECOND.inMilliseconds * 60,
  inSeconds: ONE_SECOND.inSeconds * 60,
}
export const ONE_HOUR = {
  inMilliseconds: ONE_MINUTE.inMilliseconds * 60,
  inSeconds: ONE_MINUTE.inSeconds * 60,
}
export const ONE_DAY = {
  inMilliseconds: ONE_HOUR.inMilliseconds * 24,
  inSeconds: ONE_HOUR.inSeconds * 24,
}
export const ONE_WEEK = {
  inMilliseconds: ONE_DAY.inMilliseconds * 7,
  inSeconds: ONE_DAY.inSeconds * 7,
}
export const ONE_MONTH = {
  inMilliseconds: ONE_DAY.inMilliseconds * 30,
  inSeconds: ONE_DAY.inSeconds * 30,
}

// Fees
export const SHOPIFY_FEE = 1 // 1%
export const CREDIT_CARD_FEE = 6.5 // 6.5%
export const DEFAULT_MARGIN = SHOPIFY_FEE + CREDIT_CARD_FEE // 7.5%
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

export const PRODUCT_METAFIELDS = {
  OriginalCurrency: "original_product_currency",
  OriginalDescription: "original_product_description",
  OriginalPrice: "original_product_price",
  OriginalTitle: "original_product_title",
  OriginalUrl: "original_product_url",
} as const
export type ProductMetafield =
  (typeof PRODUCT_METAFIELDS)[keyof typeof PRODUCT_METAFIELDS]

export const CLOUDFLARE_IMAGES_ACCOUNT_HASH = "wHwwAqNxbuESOwdHNE6NsQ"

export const QUEUE_NAMES = {
  AddItemToListing: "ADD_ITEM_TO_LISTING",
  AddTagsToOrder: "ADD_TAGS_TO_ORDER",
  AutomatedAbandonedCheckoutsNotification:
    "AUTOMATED_ABANDONED_CHECKOUTS_NOTIFICATION",
  ClearCart: "CLEAR_CART",
  CreateInvoice: "CREATE_INVOICE",
  CreateItemPurchase: "CREATE_ITEM_PURCHASE",
  CreateListingCommerceEntity: "CREATE_LISTING_COMMERCE_ENTITY",
  CreatePurchase: "CREATE_PURCHASE",
  MarkPurchaseAsPaid: "MARK_PURCHASE_AS_PAID",
  NotifyPurchase: "NOTIFY_PURCHASE",
  SaveOrderCustomer: "SAVE_ORDER_CUSTOMER",
  SendInvoice: "SEND_INVOICE",
  SendSlackMessage: "SEND_SLACK_MESSAGE",
  SendWhatsAppTemplateMessage: "SEND_WHATSAPP_TEMPLATE_MESSAGE",
}

export const GOOGLE_FONTS_CSS_API_URL = "https://fonts.googleapis.com/css2"

export const HOMEPAGE_URL = "https://thelisting.do"

export const REDIRECT_URL = "https://somos.thelisting.do"

export const REGISTRATION_TYPEFORM_ID = "qN3Covsa"

export const IMAGE_MIME_TYPES = {
  "image/gif": [".gif"],
  "image/jpg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
}

export const FORBIDDEN_PATHS = [
  "about",
  "contact",
  "dashboard",
  "login",
  "logout",
  "privacy-policy",
  "privacy",
  "register",
  "terms-of-service",
  "terms",
]
