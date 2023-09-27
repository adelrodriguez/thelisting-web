import {
  SHOPIFY_ADMIN_ACCESS_TOKEN,
  SHOPIFY_API_VERSION,
  SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  SHOPIFY_STORE_DOMAIN,
} from "~/config/env.server"

export const shopifyStorefrontAPIEndpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`
export const shopifyStorefrontAPIHeaders = {
  "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
} as const
export const shopifyAdminAPIEndpoint = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`
export const shopifyAdminAPIHeaders = {
  "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
} as const
