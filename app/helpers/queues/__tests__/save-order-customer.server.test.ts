import { generateMock } from "@anatine/zod-mock"
import { faker } from "@faker-js/faker"
import { Job } from "bullmq"
import { beforeEach, expect, test, vi } from "vitest"

import db from "~/helpers/__mocks__/db.server"
import { Alegra } from "~/services/alegra.server"
import {
  CreateContactResponseSchema,
  GetContactResponseSchema,
} from "~/utils/alegra"

import type { QueueData } from "../save-order-customer.server"
import queue, { processor } from "../save-order-customer.server"

let job: Job<QueueData>
const email = faker.internet.email()

vi.mock("~/helpers/db.server")
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
        email,
      },
      name: "#1234",
    })
  ),
}))

beforeEach(() => {
  job = new Job(queue, "test", {
    orderId: faker.datatype.number(),
  })
})

test("calls the POST /contacts endpoint", async () => {
  const mockCreate = vi.fn(() =>
    Promise.resolve(generateMock(CreateContactResponseSchema))
  )
  const mockGet = vi.fn(() =>
    Promise.resolve(generateMock(GetContactResponseSchema))
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
    Promise.resolve(generateMock(CreateContactResponseSchema))
  )
  const mockGet = vi.fn(() =>
    Promise.resolve(generateMock(GetContactResponseSchema))
  )

  db.customer.findUnique.mockResolvedValue({
    alegraId: faker.datatype.uuid(),
    commerceId: faker.datatype.uuid(),
    createdAt: faker.date.past(),
    email,
    id: faker.datatype.uuid(),
    name: faker.name.fullName(),
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
