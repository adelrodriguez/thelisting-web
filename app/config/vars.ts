import { CLOUDFLARE_ACCOUNT_ID } from "~/config/env.server"

export const isDevelopment = process.env.NODE_ENV !== "production"
export const isProduction = process.env.NODE_ENV === "production"
export const isTest = process.env.NODE_ENV === "test"

export const CLOUDFLARE_R2_ENDPOINT = `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
