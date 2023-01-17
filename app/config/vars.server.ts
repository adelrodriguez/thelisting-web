import { SHOPIFY_API_VERSION, SHOPIFY_STORE_DOMAIN } from "./env.server"

export const isDev = process.env.NODE_ENV !== "production"
export const isProduction = process.env.NODE_ENV === "production"
export const isTest = process.env.NODE_ENV === "test"

export const xStateVisualizer = process.env.XSTATE_VISUALIZER === "true"

export const shopifyStorefrontAPIEndpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`
export const shopifyAdminAPIEndpoint = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`
