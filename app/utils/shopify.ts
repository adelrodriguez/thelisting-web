import { z } from "zod"

import type { CustomAttribute } from "~/config/consts"
import { CUSTOM_ATTRIBUTES } from "~/config/consts"
import { BadRequest, getHeaders } from "~/utils/http.server"

export const OrderPaymentWebhookPayloadSchema = z.object({
  id: z.number(),
  number: z.number(),
})
export type OrderPaymentWebhookPayload = z.infer<
  typeof OrderPaymentWebhookPayloadSchema
>
export function parseOrderPaymentWebhookPayload(
  body: unknown
): OrderPaymentWebhookPayload {
  return OrderPaymentWebhookPayloadSchema.parse(body)
}

export const OrderCreationWebhookPayloadSchema = z.object({
  id: z.number(),
  number: z.number(),
})
export type OrderCreationWebhookPayload = z.infer<
  typeof OrderCreationWebhookPayloadSchema
>
export function parseOrderCreationWebhookPayload(
  body: unknown
): OrderCreationWebhookPayload {
  return OrderCreationWebhookPayloadSchema.parse(body)
}

export function getShopifyWebhookHeaders(request: Request) {
  const headers = getHeaders(request)

  const webhookId = headers.get("X-Shopify-Webhook-Id")
  const event = headers.get("X-Shopify-Topic")

  if (!webhookId || !event) {
    throw BadRequest
  }

  return { event, webhookId }
}

export function getShopifyId(
  id: string | number,
  type: "Order" | "Product" | "Collection"
) {
  return `gid://shopify/${type}/${id}`
}

export function getShopifyIdNumber(id: string) {
  return Number(id.split("/").pop())
}

export function transformCustomAttributes(
  customAttributes: Array<{ key: string; value?: string | null }>
): Record<CustomAttribute, string | null> {
  const customAttributesKeys = Object.values(CUSTOM_ATTRIBUTES)

  return customAttributes.reduce((acc, { key, value }) => {
    if (customAttributesKeys.includes(key as CustomAttribute) && value) {
      acc[key as CustomAttribute] = value
    }

    return acc
  }, {} as Record<CustomAttribute, string>)
}
