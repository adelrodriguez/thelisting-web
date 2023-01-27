import { z } from "zod"

export const GetContactRequestSchema = z.object({
  id: z.string(),
})
export type GetContactRequest = z.infer<typeof GetContactRequestSchema>
export function parseGetContactRequest(data: unknown): GetContactRequest {
  return GetContactRequestSchema.parse(data)
}

export const GetContactResponseSchema = z.object({
  email: z.string().email(),
  id: z.string(),
})
export type GetContactResponse = z.infer<typeof GetContactResponseSchema>
export function parseGetContactResponse(data: unknown): GetContactResponse {
  return GetContactResponseSchema.parse(data)
}

export const CreateContactRequestSchema = z.object({
  address: z.object({
    address: z.string(),
    city: z.string(),
  }),
  email: z.string().email(),
  name: z.string().max(90),
  phonePrimary: z.string(),
  type: z.enum(["client", "provider"]),
})
export type CreateContactRequest = z.infer<typeof CreateContactRequestSchema>
export function parseCreateContactRequest(data: unknown): CreateContactRequest {
  return CreateContactRequestSchema.parse(data)
}

export const CreateContactResponseSchema = z.object({
  email: z.string().email(),
  id: z.string(),
})
export type CreateContactResponse = z.infer<typeof CreateContactResponseSchema>
export function parseCreateContactResponse(
  data: unknown
): CreateContactResponse {
  return CreateContactResponseSchema.parse(data)
}

export const GetCurrencyRequestSchema = z.object({
  code: z.string(),
})
export type GetCurrencyRequest = z.infer<typeof GetCurrencyRequestSchema>
export function parseGetCurrencyRequest(data: unknown): GetCurrencyRequest {
  return GetCurrencyRequestSchema.parse(data)
}

export const GetCurrencyResponseSchema = z.object({
  code: z.string(),
  exchangeRate: z.number(),
  name: z.string(),
  status: z.string(),
  symbol: z.string(),
})
export type GetCurrencyResponse = z.infer<typeof GetCurrencyResponseSchema>
export function parseGetCurrencyResponse(data: unknown): GetCurrencyResponse {
  return GetCurrencyResponseSchema.parse(data)
}

export const CreateInvoiceRequestSchema = z.object({
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
export type CreateInvoiceRequest = z.infer<typeof CreateInvoiceRequestSchema>
export function parseCreateInvoiceRequest(data: unknown): CreateInvoiceRequest {
  return CreateInvoiceRequestSchema.parse(data)
}

export const CreateInvoiceResponseSchema = z.object({
  id: z.string(),
  numberTemplate: z.object({
    fullNumber: z.string(),
  }),
})
export type CreateInvoiceResponse = z.infer<typeof CreateInvoiceResponseSchema>
export function parseCreateInvoiceResponse(
  data: unknown
): CreateInvoiceResponse {
  return CreateInvoiceResponseSchema.parse(data)
}

export const SendInvoiceRequestSchema = z.object({
  emails: z.array(z.string().email()),
  id: z.string(),
})
export type SendInvoiceRequest = z.infer<typeof SendInvoiceRequestSchema>
export function parseSendInvoiceRequest(data: unknown): SendInvoiceRequest {
  return SendInvoiceRequestSchema.parse(data)
}

export const SendInvoiceResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
})
export type SendInvoiceResponse = z.infer<typeof SendInvoiceResponseSchema>
export function parseSendInvoiceResponse(data: unknown): SendInvoiceResponse {
  return SendInvoiceResponseSchema.parse(data)
}
