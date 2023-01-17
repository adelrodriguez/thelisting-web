import request from "graphql-request"

import { SHIPPING_METHOD } from "~/config/consts"
import {
  SHOPIFY_WEBHOOK_SECRET,
  SHOPIFY_ADMIN_ACCESS_TOKEN,
} from "~/config/env.server"
import { shopifyAdminAPIEndpoint } from "~/config/vars.server"
import { CreateDraftOrder } from "~/services/shopify"
import type { CartItem } from "~/utils/cart"
import { Base64, hmacSHA256 } from "~/utils/crypto.server"

import { ShopifyError } from "./error"

export async function verifyWebhook(request: Request) {
  const cloned = request.clone()
  const body = await cloned.text()
  const headers = cloned.headers
  const hmac = headers.get("X-Shopify-Hmac-Sha256")

  const hmacPayload = encodeWebhookSignature(body, SHOPIFY_WEBHOOK_SECRET)

  return hmac === hmacPayload
}

export function encodeWebhookSignature(payload: string, secret: string) {
  return Base64.stringify(hmacSHA256(payload, secret))
}

export async function createCheckout(
  cartItems: CartItem[],
  shipping: number,
  sku: string
) {
  const lineItems = cartItems.map((cartItem) => ({
    quantity: cartItem.quantity,
    variantId: cartItem.variantId,
  }))

  const response = await request(
    shopifyAdminAPIEndpoint,
    CreateDraftOrder,
    {
      input: {
        lineItems,
        note: "This is a test order", // TODO(adelrodriguez): Add a cart note
        shippingLine: {
          price: shipping,
          shippingRateHandle: "shopify-Standard%20Shipping",
          title: SHIPPING_METHOD,
        },
        tags: [`listing-${sku}`], // TODO(adelrodriguez): Replace with Listing SKU
      },
    },
    {
      "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
    }
  )

  const id = response.draftOrderCreate?.draftOrder?.id
  const url = response.draftOrderCreate?.draftOrder?.invoiceUrl

  if (!id || !url) {
    throw new ShopifyError(
      "Unable to create checkout",
      "draft_order_create_error"
    )
  }

  return { id, url }
}
