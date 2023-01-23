import type { Processor } from "bullmq"

import prisma from "~/helpers/prisma.server"
import { createQueue } from "~/helpers/queue.server"
import { createInvoiceQueue } from "~/helpers/queues"
import alegra from "~/services/alegra.server"
import Sentry from "~/services/sentry"
import type { CreateContactResponse, GetContactResponse } from "~/utils/alegra"
import { createContactRequestSchema } from "~/utils/alegra"
import { getShopifyId } from "~/utils/shopify"
import { getOrder } from "~/utils/shopify.server"

export type QueueData = {
  orderId: string | number
}

export const processor: Processor<QueueData> = async (job) => {
  try {
    const order = await getOrder(getShopifyId(job.data.orderId, "Order"))

    let contact: CreateContactResponse | GetContactResponse

    const savedContact = await prisma.customer.findUnique({
      where: { email: order.customer?.email ?? undefined },
    })

    if (savedContact) {
      job.log("Contact already exists, skipping creation")

      contact = await alegra.contacts.get({ id: savedContact.alegraId })
    } else {
      job.log("Contact does not exist, creating it")

      const request = createContactRequestSchema.parse({
        address: {
          address: order.billingAddress?.address1,
          city: order.billingAddress?.city,
        },
        email: order.customer?.email,
        name: order.customer?.displayName,
        phonePrimary: order.billingAddress?.phone,
        type: "client",
      })

      contact = await alegra.contacts.create(request)

      await prisma.customer.create({
        data: {
          alegraId: contact.id,
          email: contact.email,
        },
      })

      job.log("Contact created successfully")
    }

    // Create the invoice for the customer
    await createInvoiceQueue.add(`Order ${order.name}`, {
      contactId: contact.id,
      orderId: job.data.orderId,
    })
  } catch (error) {
    Sentry.captureException(error)

    throw error
  }
}

export default createQueue("SAVE_ORDER_CUSTOMER", processor)
