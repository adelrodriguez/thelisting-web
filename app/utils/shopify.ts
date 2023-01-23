import { z } from "zod"

export const orderPaymentWebhookPayloadSchema = z.object({
  id: z.number(),
  number: z.number(),
})
export type OrderPaymentWebhookPayload = z.infer<
  typeof orderPaymentWebhookPayloadSchema
>

export function getShopifyId(id: string | number, type: "Order") {
  return `gid://shopify/${type}/${id}`
}
