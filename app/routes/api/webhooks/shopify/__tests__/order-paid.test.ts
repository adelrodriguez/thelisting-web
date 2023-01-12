import { generateMock } from "@anatine/zod-mock"
import { expect, test, vi } from "vitest"

import { SHOPIFY_WEBHOOK_SECRET } from "~/config/env.server"
import { invoicingQueue } from "~/helpers/queues"
import { StatusCodes } from "~/utils/http.server"
import { orderPaymentWebhookPayloadSchema } from "~/utils/shopify"
import { encodeWebhookSignature } from "~/utils/shopify.server"

import { action } from "../order-paid-v1"

vi.mock("~/helpers/queues")
invoicingQueue.add = vi.fn()

test("returns Unauthorized if no auth headers are provided", async () => {
  const request = new Request("https://shopify.com", {
    body: JSON.stringify(generateMock(orderPaymentWebhookPayloadSchema)),
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
  const signature = encodeWebhookSignature(body, SHOPIFY_WEBHOOK_SECRET)

  const request = new Request("https://shopify.com", {
    body,
    headers: {
      "X-Shopify-Hmac-Sha256": signature,
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
  const signature = encodeWebhookSignature(body, SHOPIFY_WEBHOOK_SECRET)

  const request = new Request("https://shopify.com", {
    body,
    headers: {
      "X-Shopify-Hmac-Sha256": signature,
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
