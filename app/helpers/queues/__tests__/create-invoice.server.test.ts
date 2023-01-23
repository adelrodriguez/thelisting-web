import { generateMock } from "@anatine/zod-mock"
import { faker } from "@faker-js/faker"
import { Job } from "bullmq"
import { beforeEach, expect, test, vi } from "vitest"

import { Alegra } from "~/services/alegra.server"
import {
  createInvoiceResponseSchema,
  getCurrencyResponseSchema,
  sendInvoiceResponseSchema,
} from "~/utils/alegra"

import type { QueueData } from "../create-invoice.server"
import queue, { processor } from "../create-invoice.server"

let job: Job<QueueData>

vi.mock("~/helpers/prisma.server")
vi.mock("~/services/sentry")
vi.mock("~/utils/shopify.server", () => ({
  getOrder: vi.fn(() =>
    Promise.resolve({
      billingAddress: {
        address1: faker.address.streetAddress(),
        address2: faker.address.secondaryAddress(),
        city: faker.address.city(),
        phone: faker.phone.number(),
      },
      createdAt: faker.date.past().toISOString(),
      currencyCode: "DOP",
      customer: {
        displayName: faker.name.fullName(),
        email: faker.internet.email(),
      },
      name: "#1234",
    })
  ),
}))

beforeEach(() => {
  job = new Job(queue, "test", {
    contactId: faker.datatype.uuid(),
    orderId: faker.datatype.number(),
  })
})

test("calls the GET /currencies/:code endpoint", async () => {
  const spy = vi
    .spyOn(Alegra.prototype, "currencies", "get")
    .mockImplementation(() => ({
      get: vi.fn(() =>
        Promise.resolve(generateMock(getCurrencyResponseSchema))
      ),
    }))

  await processor(job)

  expect(spy).toHaveBeenCalled()
})

test("calls the POST /invoices endpoints", async () => {
  const mockCreate = vi.fn(() =>
    Promise.resolve(generateMock(createInvoiceResponseSchema))
  )

  vi.spyOn(Alegra.prototype, "invoices", "get").mockImplementation(() => ({
    create: mockCreate,
    send: vi.fn(() => Promise.resolve(generateMock(sendInvoiceResponseSchema))),
  }))

  await processor(job)

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

  await processor(job)

  expect(mockSend).toHaveBeenCalled()
})
