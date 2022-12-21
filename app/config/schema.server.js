const z = require("zod")

/**
 * We specify the server-side environment variables schema here.
 * This way we can ensure that the app is not built with invalid env vars.
 */
module.exports = z.object({
  COOKIE_SIGNING_SECRET: z.string(),

  DATABASE_URL: z.string().url(),

  META_GRAPH_API_USER_ACCESS_TOKEN: z.string(),
  META_GRAPH_API_VERSION: z.string(),

  NODE_ENV: z.enum(["development", "test", "production"]),

  REMIX_AUTH_SECRET: z.string(),

  SENDGRID_API_KEY: z.string(),
  SENDGRID_SENDER_EMAIL: z.string(),

  WHATSAPP_PHONE_NUMBER_ID: z.string(),
})
