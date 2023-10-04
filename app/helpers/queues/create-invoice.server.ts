import type { Processor } from "bullmq"

import { QUEUE_NAMES, SHIPPING_FEE } from "~/config/consts"
import {
  ALEGRA_INVOICE_BACKUP_EMAIL,
  ALEGRA_SERVICE_ITEM_ID,
} from "~/config/env.server"
import { isDevelopment } from "~/config/vars"
import { createQueue } from "~/helpers/queue.server"
import alegra from "~/services/alegra.server"
import { CurrencySchema } from "~/utils/money"
import { getShopifyId } from "~/utils/shopify"
import { getOrder } from "~/utils/shopify.server"

export type QueueData = {
  orderId: string | number
  contactId: string
}

export const processor: Processor<QueueData> = async (job) => {
  if (isDevelopment) {
    await job.log("Development mode, skipping")
    return
  }

  const order = await getOrder(getShopifyId(job.data.orderId, "Order"))
  const contact = await alegra.contacts.get({ id: job.data.contactId })

  const { exchangeRate } = await alegra.currencies.get({
    code: CurrencySchema.parse(order.currencyCode),
  })

  const shippingFee = SHIPPING_FEE * exchangeRate

  const invoice = await alegra.invoices.create({
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

  const invoiceNumber = invoice.numberTemplate.fullNumber

  await job.log(`Invoice ${invoiceNumber} created for Order ${order.name}`)

  const emails = [contact.email, ALEGRA_INVOICE_BACKUP_EMAIL]

  await alegra.invoices.send({ emails, id: invoice.id })

  await job.log(`Invoice ${invoiceNumber} sent to ${emails.join(", ")}`)
}

export default createQueue(QUEUE_NAMES.CreateInvoice, processor)
