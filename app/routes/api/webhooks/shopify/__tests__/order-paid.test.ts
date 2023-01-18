import { generateMock } from "@anatine/zod-mock"
import { expect, test, vi } from "vitest"

import { HOOKDECK_SIGNING_SECRET } from "~/config/env.server"
import { invoicingQueue } from "~/helpers/queues"
import { StatusCodes } from "~/utils/http.server"
import { orderPaymentWebhookPayloadSchema } from "~/utils/shopify"
import { encodeWebhookSignature } from "~/utils/webhook.server"

import { action } from "../order-paid-v1"

vi.mock("~/helpers/queues")
invoicingQueue.add = vi.fn()

test("returns Unauthorized if x-hookdeck-verified is 'false'", async () => {
  const request = new Request("https://shopify.com", {
    body: JSON.stringify(generateMock(orderPaymentWebhookPayloadSchema)),
    headers: {
      "x-hookdeck-verified": "false",
    },
    method: "POST",
  })

  const response = await action({
    context: {},
    params: {},
    request,
  })

  expect(response.status).toBe(StatusCodes.UNAUTHORIZED)
})

test("returns OK if the webhook is processed successfully", async () => {
  const body = JSON.stringify(generateMock(orderPaymentWebhookPayloadSchema))
  const signature = encodeWebhookSignature(body, HOOKDECK_SIGNING_SECRET)

  const request = new Request("https://shopify.com", {
    body,
    headers: {
      "x-hookdeck-signature": signature,
      "x-hookdeck-verified": "true",
    },
    method: "POST",
  })

  const response = await action({
    context: {},
    params: {},
    request,
  })

  expect(response.status).toBe(StatusCodes.OK)
})

test("calls the invoicing queue", async () => {
  const body = JSON.stringify(generateMock(orderPaymentWebhookPayloadSchema))
  const signature = encodeWebhookSignature(body, HOOKDECK_SIGNING_SECRET)

  const request = new Request("https://shopify.com", {
    body,
    headers: {
      "x-hookdeck-signature": signature,
      "x-hookdeck-verified": "true",
    },
    method: "POST",
  })

  await action({
    context: {},
    params: {},
    request,
  })

  expect(invoicingQueue.add).toHaveBeenCalled()
})
