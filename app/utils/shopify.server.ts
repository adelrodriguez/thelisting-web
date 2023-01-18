import Base64 from "crypto-js/enc-base64"
import hmacSHA256 from "crypto-js/hmac-sha256"
import request from "graphql-request"

import { SHIPPING_METHOD } from "~/config/consts"
import { SHOPIFY_WEBHOOK_SECRET } from "~/config/env.server"
import {
  shopifyAdminAPInHeaders,
  shopifyAdminAPIEndpoint,
} from "~/config/vars.server"
import type { DraftOrderLineItemInput } from "~/services/shopify/admin"
import {
  draftOrderCreateMutation,
  getOrderQuery,
} from "~/services/shopify/admin"
import type { CartItem } from "~/utils/cart"
import { ShopifyError } from "~/utils/error"

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
  note: string,
  meta: {
    sku: string
    listingId: string
  }
) {
  const lineItems: DraftOrderLineItemInput[] = cartItems.map((cartItem) => ({
    quantity: cartItem.quantity,
    variantId: cartItem.variantId,
  }))

  // Add the shipping item
  lineItems.push({
    originalUnitPrice: shipping,
    quantity: 1,
    title: SHIPPING_METHOD,
  })

  const response = await request(
    shopifyAdminAPIEndpoint,
    draftOrderCreateMutation,
    {
      input: {
        lineItems,
        note,
        tags: [`listing-${meta.sku}`, meta.listingId],
      },
    },
    shopifyAdminAPInHeaders
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

export async function getOrder(id: string) {
  const { order } = await request(
    shopifyAdminAPIEndpoint,
    getOrderQuery,
    {
      id,
    },
    shopifyAdminAPInHeaders
  )

  if (!order) {
    throw new ShopifyError("Unable to get order", "order_get_error")
  }

  return order
}
