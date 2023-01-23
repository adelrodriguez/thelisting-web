import {
  SHOPIFY_ADMIN_ACCESS_TOKEN,
  SHOPIFY_API_VERSION,
  SHOPIFY_STORE_DOMAIN,
} from "./env.server"

export const xStateVisualizer = process.env.XSTATE_VISUALIZER === "true"

export const shopifyStorefrontAPIEndpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`
export const shopifyStorefrontAPInHeaders = {
  "X-Shopify-Storefront-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
} as const
export const shopifyAdminAPIEndpoint = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`
export const shopifyAdminAPInHeaders = {
  "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
} as const
