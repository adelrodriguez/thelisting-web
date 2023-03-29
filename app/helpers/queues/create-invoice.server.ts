import * as Sentry from "@sentry/remix"
import type { Processor } from "bullmq"

import type { Currency } from "~/config/consts"
import { QUEUE_NAMES } from "~/config/consts"
import { SHIPPING_FEE } from "~/config/consts"
import {
  ALEGRA_INVOICE_BACKUP_EMAIL,
  ALEGRA_SERVICE_ITEM_ID,
} from "~/config/env.server"
import logger from "~/helpers/logger.server"
import { createQueue } from "~/helpers/queue.server"
import alegra from "~/services/alegra.server"
import { CreateInvoiceRequestSchema } from "~/utils/alegra"
import { getShopifyId } from "~/utils/shopify"
import { getOrder } from "~/utils/shopify.server"

export type QueueData = {
  orderId: string | number
  contactId: string
}

export const processor: Processor<QueueData> = async (job) => {
  try {
    const order = await getOrder(getShopifyId(job.data.orderId, "Order"))
    const contact = await alegra.contacts.get({ id: job.data.contactId })

    const { exchangeRate } = await alegra.currencies.get({
      // Shopify's CurrencyCode is similar to our Currency, so we're casting it
      // here
      code: order.currencyCode as Currency,
    })

    const shippingFee = SHIPPING_FEE * exchangeRate

    const request = CreateInvoiceRequestSchema.parse({
      anotation: `Para Order ${order.name}`,
      client: job.data.contactId,
      comments: [`Order ${order.name}`],
      date: order.createdAt,
      dueDate: order.createdAt,
      items: [
        {
          id: ALEGRA_SERVICE_ITEM_ID,
          price: shippingFee,
          quantity: 1,
        },
      ],
      status: "open",
    })

    const invoice = await alegra.invoices.create(request)
    const invoiceNumber = invoice.numberTemplate.fullNumber

    logger.info(`Invoice ${invoiceNumber} created for Order ${order.name}`)

    const emails = [contact.email, ALEGRA_INVOICE_BACKUP_EMAIL]

    await alegra.invoices.send({ emails, id: invoice.id })

    logger.info(`Invoice ${invoiceNumber} sent to ${emails.join(", ")}`)
  } catch (error) {
    Sentry.captureException(error)

    throw error
  }
}

export default createQueue(QUEUE_NAMES.CreateInvoice, processor)
