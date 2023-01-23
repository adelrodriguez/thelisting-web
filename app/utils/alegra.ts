import { z } from "zod"

export const getContactRequestSchema = z.object({
  id: z.string(),
})
export type GetContactRequest = z.infer<typeof getContactRequestSchema>
export function parseGetContactRequest(data: unknown): GetContactRequest {
  return getContactRequestSchema.parse(data)
}

export const getContactResponseSchema = z.object({
  email: z.string().email(),
  id: z.string(),
})
export type GetContactResponse = z.infer<typeof getContactResponseSchema>
export function parseGetContactResponse(data: unknown): GetContactResponse {
  return getContactResponseSchema.parse(data)
}

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
export function parseCreateContactRequest(data: unknown): CreateContactRequest {
  return createContactRequestSchema.parse(data)
}

export const createContactResponseSchema = z.object({
  email: z.string().email(),
  id: z.string(),
})
export type CreateContactResponse = z.infer<typeof createContactResponseSchema>
export function parseCreateContactResponse(
  data: unknown
): CreateContactResponse {
  return createContactResponseSchema.parse(data)
}

export const getCurrencyRequestSchema = z.object({
  code: z.string(),
})
export type GetCurrencyRequest = z.infer<typeof getCurrencyRequestSchema>
export function parseGetCurrencyRequest(data: unknown): GetCurrencyRequest {
  return getCurrencyRequestSchema.parse(data)
}

export const getCurrencyResponseSchema = z.object({
  code: z.string(),
  exchangeRate: z.number(),
  name: z.string(),
  status: z.string(),
  symbol: z.string(),
})
export type GetCurrencyResponse = z.infer<typeof getCurrencyResponseSchema>
export function parseGetCurrencyResponse(data: unknown): GetCurrencyResponse {
  return getCurrencyResponseSchema.parse(data)
}

export const createInvoiceRequestSchema = z.object({
  anotation: z.string(),
  client: z.string(),
  comments: z.array(z.string()),
  date: z.string(),
  dueDate: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      price: z.number(),
      quantity: z.number(),
    })
  ),
  status: z.enum(["open", "draft"]),
})
export type CreateInvoiceRequest = z.infer<typeof createInvoiceRequestSchema>
export function parseCreateInvoiceRequest(data: unknown): CreateInvoiceRequest {
  return createInvoiceRequestSchema.parse(data)
}

export const createInvoiceResponseSchema = z.object({
  id: z.string(),
  numberTemplate: z.object({
    fullNumber: z.string(),
  }),
})
export type CreateInvoiceResponse = z.infer<typeof createInvoiceResponseSchema>
export function parseCreateInvoiceResponse(
  data: unknown
): CreateInvoiceResponse {
  return createInvoiceResponseSchema.parse(data)
}

export const sendInvoiceRequestSchema = z.object({
  emails: z.array(z.string().email()),
  id: z.string(),
})
export type SendInvoiceRequest = z.infer<typeof sendInvoiceRequestSchema>
export function parseSendInvoiceRequest(data: unknown): SendInvoiceRequest {
  return sendInvoiceRequestSchema.parse(data)
}

export const sendInvoiceResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
})
export type SendInvoiceResponse = z.infer<typeof sendInvoiceResponseSchema>
export function parseSendInvoiceResponse(data: unknown): SendInvoiceResponse {
  return sendInvoiceResponseSchema.parse(data)
}
