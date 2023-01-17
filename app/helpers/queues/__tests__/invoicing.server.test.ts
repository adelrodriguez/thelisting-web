import { generateMock } from "@anatine/zod-mock"
import { faker } from "@faker-js/faker"
import { Job } from "bullmq"
import { beforeEach, expect, test, vi } from "vitest"

import prisma from "~/helpers/__mocks__/prisma.server"
import { Alegra } from "~/services/alegra.server"
import {
  createContactResponseSchema,
  createInvoiceResponseSchema,
  getContactResponseSchema,
  getCurrencyResponseSchema,
  sendInvoiceResponseSchema,
} from "~/utils/alegra"

import type { QueueData } from "../invoicing.server"
import queue, { processor } from "../invoicing.server"

let job: Job<QueueData>

vi.mock("~/helpers/prisma.server")

beforeEach(() => {
  job = new Job(queue, "test", {
    address: faker.address.streetAddress(),
    city: faker.address.city(),
    currencyCode: "DOP",
    date: faker.date.past().toISOString(),
    email: faker.internet.email(),
    name: faker.name.fullName(),
    orderNumber: faker.datatype.number(),
    phone: faker.phone.number(),
    shippingPrice: faker.datatype.number(),
  })
})

test("calls the POST /contacts endpoint", async () => {
  const mockCreate = vi.fn(() =>
    Promise.resolve(generateMock(createContactResponseSchema))
  )
  const mockGet = vi.fn(() =>
    Promise.resolve(generateMock(getContactResponseSchema))
  )

  vi.spyOn(Alegra.prototype, "contacts", "get").mockImplementation(() => ({
    create: mockCreate,
    get: mockGet,
  }))

  await processor(job)

  expect(mockCreate).toHaveBeenCalled()
  expect(mockGet).not.toHaveBeenCalled()
})

test("calls the GET /contacts/:id endpoint if the contact already exists", async () => {
  const mockCreate = vi.fn(() =>
    Promise.resolve(generateMock(createContactResponseSchema))
  )
  const mockGet = vi.fn(() =>
    Promise.resolve(generateMock(getContactResponseSchema))
  )

  prisma.customer.findUnique.mockResolvedValue({
    alegraId: faker.datatype.uuid(),
    createdAt: faker.date.past(),
    email: job.data.email,
    id: faker.datatype.uuid(),
    updatedAt: faker.date.past(),
  })

  vi.spyOn(Alegra.prototype, "contacts", "get").mockImplementation(() => ({
    create: mockCreate,
    get: mockGet,
  }))

  await processor(job)

  expect(mockGet).toHaveBeenCalled()
  expect(mockCreate).not.toHaveBeenCalled()
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
