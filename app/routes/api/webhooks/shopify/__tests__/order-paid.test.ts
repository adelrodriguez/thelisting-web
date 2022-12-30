import { generateMock } from "@anatine/zod-mock"
import { faker } from "@faker-js/faker"
import { describe, expect, test, vi } from "vitest"

import { SHOPIFY_WEBHOOK_SECRET } from "~/config/env.server"
import { Alegra } from "~/services/alegra.server"
import {
  createInvoiceResponseSchema,
  getCurrencyResponseSchema,
  sendInvoiceResponseSchema,
} from "~/utils/alegra"
import { StatusCodes } from "~/utils/http.server"
import { orderPaymentWebhookPayloadSchema } from "~/utils/shopify"
import { encodeWebhookSignature } from "~/utils/shopify.server"

import { action } from "../order-paid-v1"

describe("auth", () => {
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
})

describe("alegra", () => {
  test("calls the POST /contacts endpoint", async () => {
    const spy = vi
      .spyOn(Alegra.prototype, "contacts", "get")
      .mockImplementation(() => ({
        create: vi.fn(() =>
          Promise.resolve({
            email: faker.internet.email(),
            id: faker.datatype.uuid(),
          })
        ),
      }))

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

    expect(spy).toHaveBeenCalled()
  })

  test("calls the GET /currencies/:code endpoint", async () => {
    const spy = vi
      .spyOn(Alegra.prototype, "currencies", "get")
      .mockImplementation(() => ({
        get: vi.fn(() =>
          Promise.resolve(generateMock(getCurrencyResponseSchema))
        ),
      }))

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

    expect(spy).toHaveBeenCalled()
  })

  test("calls the POST /invoices endpoints", async () => {
    const mockCreate = vi.fn(() =>
      Promise.resolve(generateMock(createInvoiceResponseSchema))
    )

    vi.spyOn(Alegra.prototype, "invoices", "get").mockImplementation(() => ({
      create: mockCreate,
      send: vi.fn(() =>
        Promise.resolve(generateMock(sendInvoiceResponseSchema))
      ),
    }))

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

    expect(mockCreate).toHaveBeenCalled()
  })

  test("calls the POST /invoices/:id/email endpoints", async () => {
    const mockSend = vi.fn(() =>
      Promise.resolve(generateMock(sendInvoiceResponseSchema))
    )

    vi.spyOn(Alegra.prototype, "invoices", "get").mockImplementation(() => ({
      create: vi.fn(() =>
        Promise.resolve(generateMock(createInvoiceResponseSchema))
      ),
      send: mockSend,
    }))

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

    expect(mockSend).toHaveBeenCalled()
  })
})
