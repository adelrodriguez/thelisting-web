import { generateMock } from "@anatine/zod-mock"
import { faker } from "@faker-js/faker"
import type {
  DefaultRequestMultipartBody,
  MockedRequest,
  RestHandler,
} from "msw"
import { rest } from "msw"

import {
  createInvoiceResponseSchema,
  getCurrencyResponseSchema,
  sendInvoiceResponseSchema,
} from "~/utils/alegra"

export const alegraHandlers: Array<
  RestHandler<MockedRequest<DefaultRequestMultipartBody>>
> = [
  rest.post("https://app.alegra.com/api/v1/contacts", async (req, res, ctx) => {
    const body = await req.json()

    return res(ctx.json({ email: body.email, id: faker.datatype.uuid() }))
  }),
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
