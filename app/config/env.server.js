// This needs to be a JavaScript file to be able to run at build time
require("dotenv").config()
const z = require("zod")

/**
 * We specify the server-side environment variables schema here. This way we can
 * ensure that the app is not built with invalid environment variables.
 */
const schema = z.object({
  ADMIN_PHONE_NUMBER: z.string(),

  ALEGRA_API_TOKEN: z.string(),
  ALEGRA_API_USERNAME: z.string(),
  ALEGRA_INVOICE_BACKUP_EMAIL: z.string(),
  ALEGRA_SERVICE_ITEM_ID: z.string(),

  AXIOM_DATASET: z.string(),
  AXIOM_ORG_ID: z.string(),
  AXIOM_TOKEN: z.string(),

  BASE_URL: z.string().url(),

  BROWSERLESS_TOKEN: z.string(),
  BROWSERLESS_URL: z.string(),

  BULL_BOARD_PASSWORD: z.string(),
  BULL_BOARD_PORT: z.string().optional(),

  CLOUDFLARE_ACCOUNT_ID: z.string(),
  CLOUDFLARE_IMAGES_API_TOKEN: z.string(),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().url(),

  COOKIE_SIGNING_SECRET: z.string(),

  DATABASE_URL: z.string().url(),

  GA_TRACKING_ID: z.string(),

  GOOGLE_WEB_FONTS_DEVELOPER_API_KEY: z.string(),
  GOOGLE_WEB_FONTS_URL: z.string(),

  HOOKDECK_SIGNING_SECRET: z.string(),

  LOGIN_SENDER_EMAIL: z.string(),

  META_GRAPH_API_USER_ACCESS_TOKEN: z.string(),
  META_GRAPH_API_VERSION: z.string(),

  NODE_ENV: z.enum(["development", "test", "production"]),

  POSTHOG_API_KEY: z.string(),
  POSTHOG_HOST: z.string().url(),

  RAILWAY_GIT_COMMIT_SHA: z.string().optional(),
  RAILWAY_STATIC_URL: z.string().optional(),

  REDIS_CACHE_URL: z.string().url(),
  REDIS_JOBS_URL: z.string().url(),

  REMIX_AUTH_SECRET: z.string(),

  RESEND_API_KEY: z.string(),

  SCRAPER_TOKEN: z.string(),
  SCRAPER_URL: z.string(),

  SENDGRID_API_KEY: z.string(),
  SENDGRID_SENDER_EMAIL: z.string(),

  SENTRY_DSN: z.string(),

  SHOPIFY_ADMIN_ACCESS_TOKEN: z.string(),
  SHOPIFY_API_VERSION: z.string(),
  SHOPIFY_DELEGATE_TOKEN: z.string(),
  SHOPIFY_SHIPPING_ITEM_1_ID: z.string(),
  SHOPIFY_STORE: z.string(),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string(),
  SHOPIFY_STORE_DOMAIN: z.string(),

  SLACK_WEB_TOKEN: z.string(),

  STORAGE_ACCESS_KEY: z.string(),
  STORAGE_BUCKET: z.string(),
  STORAGE_SECRET: z.string(),

  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string(),

  WHATSAPP_PHONE_NUMBER_ID: z.string(),
})

const envs = schema.safeParse(process.env)

const formatErrors = (errors) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value) {
        return `${name}: ${value._errors.join(", ")}\n`
      }

      return null
    })
    .filter(Boolean)

if (!envs.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment variables:\n", ...formatErrors(envs.error.format()))
  throw new Error("You have invalid environment variables.")
}

module.exports = { ...envs.data }
