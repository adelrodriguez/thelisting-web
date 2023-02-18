import { generateMock } from "@anatine/zod-mock"
import { afterEach, expect, test, vi } from "vitest"

import { HOOKDECK_SIGNING_SECRET } from "~/config/env.server"
import { saveOrderCustomerQueue } from "~/helpers/queues"
import { StatusCodes } from "~/utils/http.server"
import { OrderPaymentWebhookPayloadSchema } from "~/utils/shopify"
import { encodeWebhookSignature } from "~/utils/webhook.server"

import { action } from "../api.webhooks.shopify.order-paid"

vi.mock("~/helpers/prisma.server")
vi.mock("~/helpers/queues")
vi.mock("~/utils/webhook.server", async () => {
  const actual = (await vi.importActual("~/utils/webhook.server")) as {}

  return {
    ...actual,
    checkIfWebhookIsRepeated: vi.fn().mockResolvedValue(false),
  }
})
saveOrderCustomerQueue.add = vi.fn()

afterEach(() => {
  vi.resetAllMocks()
})

test("returns Unauthorized if x-hookdeck-verified is 'false'", async () => {
  const request = new Request("https://shopify.com", {
    body: JSON.stringify(generateMock(OrderPaymentWebhookPayloadSchema)),
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
  const body = JSON.stringify(generateMock(OrderPaymentWebhookPayloadSchema))
  const signature = encodeWebhookSignature(body, HOOKDECK_SIGNING_SECRET)

  const request = new Request("https://shopify.com", {
    body,
    headers: {
      "X-Shopify-Topic": "orders/paid",
      "X-Shopify-Webhook-Id": "123",
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
  const body = JSON.stringify(generateMock(OrderPaymentWebhookPayloadSchema))
  const signature = encodeWebhookSignature(body, HOOKDECK_SIGNING_SECRET)

  const request = new Request("https://shopify.com", {
    body,
    headers: {
      "X-Shopify-Topic": "orders/paid",
      "X-Shopify-Webhook-Id": "123",
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

  expect(saveOrderCustomerQueue.add).toHaveBeenCalled()
})
