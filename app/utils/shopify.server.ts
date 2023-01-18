import Base64 from "crypto-js/enc-base64"
import hmacSHA256 from "crypto-js/hmac-sha256"
import request from "graphql-request"

import { SHIPPING_METHOD } from "~/config/consts"
import { SHOPIFY_WEBHOOK_SECRET } from "~/config/env.server"
import {
  SHOPIFY_WEBHOOK_SECRET,
  SHOPIFY_ADMIN_ACCESS_TOKEN,
} from "~/config/env.server"
import { shopifyAdminAPIEndpoint } from "~/config/vars.server"
import { CreateDraftOrder } from "~/services/shopify"
import type { CartItem } from "~/utils/cart"
import { Base64, hmacSHA256 } from "~/utils/crypto.server"

export async function verifyWebhook(request: Request): Promise<boolean> {
  const body = await request.text()
  const headers = request.headers
  const hmac = headers.get("X-Shopify-Hmac-Sha256")

  const hmacPayload = encodeWebhookSignature(body, SHOPIFY_WEBHOOK_SECRET)

  return hmac === hmacPayload
}

export function encodeWebhookSignature(
  payload: string,
  secret: string
): string {
  return Base64.stringify(hmacSHA256(payload, secret))
}

export function getWebhookHeaders(
  headers: Headers
): Record<"event" | "id", string | null> {
  const id = headers.get("X-Shopify-Webhook-Id")
  const event = headers.get("X-Shopify-Topic")

  return { event, id }
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
