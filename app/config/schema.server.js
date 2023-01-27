const z = require("zod")

/**
 * We specify the server-side environment variables schema here.
 * This way we can ensure that the app is not built with invalid env vars.
 */
module.exports = z.object({
  ALEGRA_API_TOKEN: z.string(),
  ALEGRA_API_USERNAME: z.string(),

  ALEGRA_INVOICE_BACKUP_EMAIL: z.string(),
  ALEGRA_SERVICE_ITEM_ID: z.string(),

  BROWSERLESS_TOKEN: z.string(),
  BROWSERLESS_URL: z.string(),

  BULL_BOARD_PASSWORD: z.string().optional(),
  BULL_BOARD_PORT: z.string().optional(),

  COOKIE_SIGNING_SECRET: z.string(),

  DATABASE_URL: z.string().url(),

  HOOKDECK_SIGNING_SECRET: z.string(),

  LOGIN_SENDER_EMAIL: z.string(),

  META_GRAPH_API_USER_ACCESS_TOKEN: z.string(),
  META_GRAPH_API_VERSION: z.string(),

  NODE_ENV: z.enum(["development", "test", "production"]),

  RAILWAY_STATIC_URL: z.string().optional(),

  REDIS_URL: z.string().url(),

  REMIX_AUTH_SECRET: z.string(),

  RESEND_API_KEY: z.string(),
  SENDGRID_API_KEY: z.string(),

  SENDGRID_SENDER_EMAIL: z.string(),

  SENTRY_DSN: z.string(),

  SHOPIFY_ADMIN_ACCESS_TOKEN: z.string(),
  SHOPIFY_API_VERSION: z.string(),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string(),
  SHOPIFY_STORE_DOMAIN: z.string(),
  SHOPIFY_WEBHOOK_SECRET: z.string(),

  WHATSAPP_PHONE_NUMBER_ID: z.string(),
})
