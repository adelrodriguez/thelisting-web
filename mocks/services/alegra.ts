import { generateMock } from "@anatine/zod-mock"
import type {
  DefaultRequestMultipartBody,
  MockedRequest,
  RestHandler,
} from "msw"
import { rest } from "msw"

import {
  CreateContactResponseSchema,
  CreateInvoiceResponseSchema,
  GetContactResponseSchema,
  GetCurrencyResponseSchema,
  SendInvoiceResponseSchema,
} from "~/utils/alegra"

export const alegraHandlers: Array<
  RestHandler<MockedRequest<DefaultRequestMultipartBody>>
> = [
  rest.post("https://app.alegra.com/api/v1/contacts", async (req, res, ctx) => {
    const response = generateMock(CreateContactResponseSchema)

    return res(ctx.json(response))
  }),
  rest.get(
    "https://app.alegra.com/api/v1/contacts/:id",
    async (req, res, ctx) => {
      const response = generateMock(GetContactResponseSchema)

      return res(ctx.json(response))
    }
  ),
  rest.get(
    "https://app.alegra.com/api/v1/currencies/:code",
    async (req, res, ctx) => {
      const response = generateMock(GetCurrencyResponseSchema)

      return res(ctx.json(response))
    }
  ),
  rest.post("https://app.alegra.com/api/v1/invoices", async (req, res, ctx) => {
    const response = generateMock(CreateInvoiceResponseSchema)

    return res(ctx.json(response))
  }),
  rest.post(
    "https://app.alegra.com/api/v1/invoices/:id/email",
    async (req, res, ctx) => {
      const response = generateMock(SendInvoiceResponseSchema)

      return res(ctx.json(response))
    }
  ),
]
