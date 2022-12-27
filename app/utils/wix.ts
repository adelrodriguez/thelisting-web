import { z } from "zod"

export const orderSchema = z.object({
  billingInfo: z.object({
    address: z.object({
      addressLine: z.string().nullish(),
      city: z.string().nullish(),
      country: z.string().nullish(),
      postalCode: z.string().nullish(),
      subdivision: z.string().nullish(),
    }),
    email: z.string().email(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    paidDate: z.string(),
    paymentMethod: z.string().nullish(),
    phone: z.string().nullish(),
  }),
  currency: z.string(),
  number: z.number(),
  totals: z.object({
    total: z.number(),
  }),
})
export type Order = z.infer<typeof orderSchema>
