import type { Processor } from "bullmq"

import db from "~/helpers/db.server"
import { createQueue } from "~/helpers/queue.server"
import { createInvoiceQueue } from "~/helpers/queues"
import alegra from "~/services/alegra.server"
import Sentry from "~/services/sentry"
import { parseCreateContactRequest } from "~/utils/alegra"
import { getShopifyId } from "~/utils/shopify"
import { getOrder } from "~/utils/shopify.server"

export type QueueData = {
  orderId: string | number
}

export const processor: Processor<QueueData> = async (job) => {
  try {
    const order = await getOrder(getShopifyId(job.data.orderId, "Order"))

    let contactId: string

    const customer = await db.customer.findUnique({
      where: { email: order.customer?.email ?? undefined },
    })

    const alegraId = customer?.alegraId

    if (alegraId) {
      job.log(`Found Alegra ID ${alegraId} for customer ${customer?.name}`)
      contactId = alegraId
    } else {
      job.log("Contact does not exist, creating it")

      const contact = await alegra.contacts.create(
        parseCreateContactRequest({
          address: {
            address: order.billingAddress?.address1,
            city: order.billingAddress?.city,
          },
          email: order.customer?.email,
          name: order.customer?.displayName,
          phonePrimary: order.billingAddress?.phone,
          type: "client",
        })
      )

      await db.customer.upsert({
        create: {
          alegraId: contact.id,
          commerceId: order.customer?.id,
          email: contact.email,
          name: order.customer?.displayName,
        },
        update: {
          alegraId: contact.id,
        },
        where: { email: order.customer?.email! },
      })

      contactId = contact.id

      job.log("Contact created successfully")
    }

    // Create the invoice for the customer
    await createInvoiceQueue.add(`Order ${order.name}`, {
      contactId,
      orderId: job.data.orderId,
    })
  } catch (error) {
    Sentry.captureException(error)

    throw error
  }
}

export default createQueue("SAVE_ORDER_CUSTOMER", processor)
