import { z } from "zod"

export const createContactRequestSchema = z.object({
  address: z.object({
    address: z.string(),
    city: z.string(),
  }),
  email: z.string().email(),
  name: z.string().max(90),
  phonePrimary: z.string(),
  type: z.enum(["client", "provider"]),
})
export type CreateContactRequest = z.infer<typeof createContactRequestSchema>

export const createContactResponseSchema = z.object({
  email: z.string().email(),
  id: z.string(),
})
export type CreateContactResponse = z.infer<typeof createContactResponseSchema>

export const getCurrencyRequestSchema = z.object({
  code: z.string(),
})
export type GetCurrencyRequest = z.infer<typeof getCurrencyRequestSchema>

export const getCurrencyResponseSchema = z.object({
  code: z.string(),
  exchangeRate: z.number(),
  name: z.string(),
  status: z.string(),
  symbol: z.string(),
})
export type GetCurrencyResponse = z.infer<typeof getCurrencyResponseSchema>

export const createInvoiceRequestSchema = z.object({
  anotation: z.string(),
  client: z.string(),
  comments: z.array(z.string()),
  date: z.string(),
  dueData: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
    })
  ),
})
export type CreateInvoiceRequest = z.infer<typeof createInvoiceRequestSchema>

export const createInvoiceResponseSchema = z.object({
  id: z.string(),
  numberTemplate: z.object({
    fullNumber: z.string(),
  }),
})
export type CreateInvoiceResponse = z.infer<typeof createInvoiceResponseSchema>

export const sendInvoiceRequestSchema = z.object({
  emails: z.array(z.string().email()),
  id: z.string(),
})
export type SendInvoiceRequest = z.infer<typeof sendInvoiceRequestSchema>

export const sendInvoiceResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
})
export type SendInvoiceResponse = z.infer<typeof sendInvoiceResponseSchema>
