import type { Processor } from "bullmq"

import prisma from "~/helpers/prisma.server"
import { createQueue } from "~/helpers/queue.server"
import Sentry from "~/services/sentry"

export type QueueData = {
  purchaseId: string
  item: {
    cost: number
    commerceId: string
    quantity: number
    total: number
  }
}

export const processor: Processor<QueueData> = async (job) => {
  try {
    const purchase = await prisma.purchase.findUniqueOrThrow({
      where: { id: job.data.purchaseId },
    })

    const item = await prisma.item.findFirstOrThrow({
      where: {
        commerceId: job.data.item.commerceId,
        listingId: purchase.listingId,
      },
    })

    await prisma.itemPurchase.create({
      data: {
        cost: job.data.item.cost,
        itemId: item.id,
        purchaseId: purchase.id,
        quantity: job.data.item.quantity,
        total: job.data.item.total,
      },
    })

    job.log(`Created item purchase ${purchase.id} → ${item.id}`)

    await prisma.item.update({
      data: {
        stock: { decrement: job.data.item.quantity },
      },
      where: { id: item.id },
    })

    job.log(
      `Updated item ${item.id} availability: ${item.stock} → ${
        item.stock - job.data.item.quantity
      })`
    )

    job.log("Finished processing item purchase")
  } catch (error) {
    Sentry.captureException(error)

    throw error
  }
}

export default createQueue("CREATE_ITEM_PURCHASE", processor)
