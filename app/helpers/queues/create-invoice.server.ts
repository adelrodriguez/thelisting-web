import * as Sentry from "@sentry/remix"
import type { Processor } from "bullmq"

import { SHIPPING_FEE } from "~/config/consts"
import {
  ALEGRA_INVOICE_BACKUP_EMAIL,
  ALEGRA_SERVICE_ITEM_ID,
} from "~/config/env.server"
import { createQueue } from "~/helpers/queue.server"
import alegra from "~/services/alegra.server"
import { createInvoiceRequestSchema } from "~/utils/alegra"
import { logger } from "~/utils/log"
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
      code: order.currencyCode,
    })

    const shippingFee = SHIPPING_FEE * exchangeRate

    const request = createInvoiceRequestSchema.parse({
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

export default createQueue("CREATE_INVOICE", processor)
