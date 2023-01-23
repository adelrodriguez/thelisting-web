import { generateMock } from "@anatine/zod-mock"
import type {
  DefaultRequestMultipartBody,
  MockedRequest,
  RestHandler,
} from "msw"
import { rest } from "msw"

import {
  createContactResponseSchema,
  createInvoiceResponseSchema,
  getContactResponseSchema,
  getCurrencyResponseSchema,
  sendInvoiceResponseSchema,
} from "~/utils/alegra"

export const alegraHandlers: Array<
  RestHandler<MockedRequest<DefaultRequestMultipartBody>>
> = [
  rest.post("https://app.alegra.com/api/v1/contacts", async (req, res, ctx) => {
    const response = generateMock(createContactResponseSchema)

    return res(ctx.json(response))
  }),
  rest.get(
    "https://app.alegra.com/api/v1/contacts/:id",
    async (req, res, ctx) => {
      const response = generateMock(getContactResponseSchema)

      return res(ctx.json(response))
    }
  ),
  rest.get(
    "https://app.alegra.com/api/v1/currencies/:code",
    async (req, res, ctx) => {
      const response = generateMock(getCurrencyResponseSchema)

      return res(ctx.json(response))
    }
  ),
  rest.post("https://app.alegra.com/api/v1/invoices", async (req, res, ctx) => {
    const response = generateMock(createInvoiceResponseSchema)

    return res(ctx.json(response))
  }),
  rest.post(
    "https://app.alegra.com/api/v1/invoices/:id/email",
    async (req, res, ctx) => {
      const response = generateMock(sendInvoiceResponseSchema)

      return res(ctx.json(response))
    }
  ),
]
