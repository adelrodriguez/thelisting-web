import { createStorefrontClient } from "@shopify/hydrogen-react"

import {
  SHOPIFY_API_VERSION,
  SHOPIFY_DELEGATE_TOKEN,
  SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  SHOPIFY_STORE_DOMAIN,
} from "~/config/env.server"

const client = createStorefrontClient({
  privateStorefrontToken: SHOPIFY_DELEGATE_TOKEN,
  publicStorefrontToken: SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  storeDomain: SHOPIFY_STORE_DOMAIN,
  storefrontApiVersion: SHOPIFY_API_VERSION,
})

export default client
