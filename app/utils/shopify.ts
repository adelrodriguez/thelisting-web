import { z } from "zod"

import { CURRENCIES } from "~/config/consts"

export const orderPaymentWebhookPayloadSchema = z.object({
  billing_address: z.object({
    address1: z.string(),
    city: z.string(),
    phone: z.string(),
  }),
  currency: z.enum([CURRENCIES.dop, CURRENCIES.usd]),
  customer: z.object({
    email: z.string(),
    first_name: z.string(),
    last_name: z.string(),
  }),
  email: z.string(),
  number: z.number(),
  processed_at: z.preprocess(
    (value) => value ?? new Date().toISOString(),
    z.string()
  ),
  shipping_lines: z.array(
    z.object({
      price: z.string(),
    })
  ),
  subtotal_price: z.string(),
  total_price: z.string(),
})
export type OrderPaymentWebhookPayload = z.infer<
  typeof orderPaymentWebhookPayloadSchema
>
