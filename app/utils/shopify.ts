import { parseGid } from "@shopify/hydrogen-react"
import { z } from "zod"

import type { CustomAttribute } from "~/config/consts"
import { CUSTOM_ATTRIBUTES } from "~/config/consts"
import { badRequest } from "~/utils/remix"
import { undefinedToNull } from "~/utils/undefined"

export const OrderPaymentWebhookPayloadSchema = z.object({
  id: z.number(),
  number: z.number(),
})
export type OrderPaymentWebhookPayload = z.infer<
  typeof OrderPaymentWebhookPayloadSchema
>
export function parseOrderPaymentWebhookPayload(body: unknown) {
  return OrderPaymentWebhookPayloadSchema.parse(body)
}

export const OrderCreationWebhookPayloadSchema = z.object({
  id: z.number(),
  number: z.number(),
})
export type OrderCreationWebhookPayload = z.infer<
  typeof OrderCreationWebhookPayloadSchema
>
export function parseOrderCreationWebhookPayload(body: unknown) {
  return OrderCreationWebhookPayloadSchema.parse(body)
}

export const CheckoutUpdateWebhookPayloadSchema = z.object({
  billing_address: z
    .object({
      name: z.preprocess(undefinedToNull, z.string().nullable()),
      phone: z.preprocess(undefinedToNull, z.string().nullable()),
    })
    .optional(),
  completed_at: z.string().nullable(),
  email: z.preprocess(undefinedToNull, z.string().nullable()),
  id: z.number(),
})
export type CheckoutUpdateWebhookPayload = z.infer<
  typeof CheckoutUpdateWebhookPayloadSchema
>
export function parseCheckoutUpdateWebhookPayload(body: unknown) {
  return CheckoutUpdateWebhookPayloadSchema.parse(body)
}

export function getShopifyWebhookHeaders(headers: Headers) {
  const webhookId = headers.get("X-Shopify-Webhook-Id")
  const event = headers.get("X-Shopify-Topic")

  if (!webhookId || !event) {
    throw badRequest({ message: "Missing webhook headers" })
  }

  return { event, webhookId }
}

export function getShopifyId(
  id: string | number,
  resource: "Order" | "Product" | "Collection" | "Checkout",
): string {
  return `gid://shopify/${resource}/${id}`
}

export function getShopifyIdNumber(id: string): string {
  return parseGid(id).id
}

export function transformCustomAttributes(
  customAttributes: Array<{ key: string; value?: string | null }>,
): Record<CustomAttribute, string | null> {
  const customAttributesKeys = Object.values(CUSTOM_ATTRIBUTES)

  return customAttributes.reduce(
    (acc, { key, value }) => {
      if (customAttributesKeys.includes(key as CustomAttribute) && value) {
        acc[key as CustomAttribute] = value
      }

      return acc
    },
    {} as Record<CustomAttribute, string>,
  )
}
