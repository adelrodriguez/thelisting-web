import { assertEnvironmentVariable } from "~/utils/env"

export const isDev = process.env.NODE_ENV !== "production"
export const isProduction = process.env.NODE_ENV === "production"
export const isTest = process.env.NODE_ENV === "test"

export const REMIX_AUTH_SECRET = assertEnvironmentVariable(
  "REMIX_AUTH_SECRET",
  process.env.REMIX_AUTH_SECRET
)

export const COOKIE_SIGNING_SECRET = assertEnvironmentVariable(
  "COOKIE_SIGNING_SECRET",
  process.env.COOKIE_SIGNING_SECRET
)

export const SENDGRID_API_KEY = assertEnvironmentVariable(
  "SENDGRID_API_KEY",
  process.env.SENDGRID_API_KEY
)

export const SENDGRID_SENDER_EMAIL = assertEnvironmentVariable(
  "SENDGRID_SENDER_EMAIL",
  process.env.SENDGRID_SENDER_EMAIL
)
