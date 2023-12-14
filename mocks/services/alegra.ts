import { generateMock } from "@anatine/zod-mock"
import { HttpResponse, http } from "msw"

import {
  CreateContactResponseSchema,
  CreateInvoiceResponseSchema,
  GetContactResponseSchema,
  GetCurrencyResponseSchema,
  SendInvoiceResponseSchema,
} from "~/utils/alegra"

export const alegraHandlers = [
  http.post("https://app.alegra.com/api/v1/contacts", async () => {
    const response = generateMock(CreateContactResponseSchema)

    return HttpResponse.json(response)
  }),
  http.get("https://app.alegra.com/api/v1/contacts/:id", async () => {
    const response = generateMock(GetContactResponseSchema)

    return HttpResponse.json(response)
  }),
  http.get("https://app.alegra.com/api/v1/currencies/:code", async () => {
    const response = generateMock(GetCurrencyResponseSchema)

    return HttpResponse.json(response)
  }),
  http.post("https://app.alegra.com/api/v1/invoices", async () => {
    const response = generateMock(CreateInvoiceResponseSchema)

    return HttpResponse.json(response)
  }),
  http.post("https://app.alegra.com/api/v1/invoices/:id/email", async () => {
    const response = generateMock(SendInvoiceResponseSchema)

    return HttpResponse.json(response)
  }),
]
