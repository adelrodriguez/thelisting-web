import { z } from "zod"

import { BadRequest, getHeaders } from "~/utils/http.server"

export const orderPaymentWebhookPayloadSchema = z.object({
  id: z.number(),
  number: z.number(),
})
export type OrderPaymentWebhookPayload = z.infer<
  typeof orderPaymentWebhookPayloadSchema
>

export const orderCreationWebhookPayloadSchema = z.object({
  id: z.number(),
  number: z.number(),
})
export type OrderCreationWebhookPayload = z.infer<
  typeof orderCreationWebhookPayloadSchema
>

export function getShopifyWebhookHeaders(request: Request) {
  const headers = getHeaders(request)

  const webhookId = headers.get("X-Shopify-Webhook-Id")
  const event = headers.get("X-Shopify-Topic")

  if (!webhookId || !event) {
    throw BadRequest
  }

  return { event, webhookId }
}

export function getShopifyId(id: string | number, type: "Order" | "Product") {
  return `gid://shopify/${type}/${id}`
}
