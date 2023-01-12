import type { Processor } from "bullmq"
import currency from "currency.js"

import type { Currency } from "~/config/consts"
import {
  ALEGRA_INVOICE_BACKUP_EMAIL,
  ALEGRA_SERVICE_ITEM_ID,
} from "~/config/env.server"
import { createQueue } from "~/helpers/queue.server"
import alegra from "~/services/alegra.server"
import {
  createContactRequestSchema,
  createInvoiceRequestSchema,
} from "~/utils/alegra"
import { logger } from "~/utils/log"

export type QueueData = {
  address: string
  city: string
  name: string
  phone: string
  email: string
  currencyCode: Currency
  shippingPrice: number | string
  orderNumber: number
  date: string
}

export const processor: Processor<QueueData> = async (job) => {
  const contactRequest = createContactRequestSchema.parse({
    address: {
      address: job.data.address,
      city: job.data.city,
    },
    email: job.data.email,
    ignoreRepeated: true,
    name: job.data.name,
    phonePrimary: job.data.phone,
    type: "client",
  })

  // Create the contact
  // TODO(adelrodriguez): Check if the contact already exists (by email). If
  // it already exists, then grab the id from there.
  const contact = await alegra.contacts.create(contactRequest)

  const { exchangeRate } = await alegra.currencies.get({
    code: job.data.currencyCode,
  })

  const shippingFee = currency(job.data.shippingPrice).multiply(
    exchangeRate
  ).value

  const invoiceRequest = createInvoiceRequestSchema.parse({
    anotation: `Para Order No. ${job.data.orderNumber}`,
    client: contact.id,
    comments: [`Order No. ${job.data.orderNumber}`],
    date: job.data.date,
    dueDate: job.data.date,
    items: [
      {
        id: ALEGRA_SERVICE_ITEM_ID,
        price: shippingFee,
        quantity: 1,
      },
    ],
    status: "open",
  })

  const invoice = await alegra.invoices.create(invoiceRequest)
  const invoiceNumber = invoice.numberTemplate.fullNumber

  logger.info(
    `Invoice ${invoiceNumber} created for order ${job.data.orderNumber}`
  )

  const emails = [contact.email, ALEGRA_INVOICE_BACKUP_EMAIL]

  await alegra.invoices.send({ emails, id: invoice.id })

  logger.info(`Invoice ${invoiceNumber} sent to ${emails.join(", ")}`)
}

export default createQueue("invoicing", processor)
