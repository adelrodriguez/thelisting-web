import type { Processor } from "bullmq"

import { QUEUE_NAMES } from "~/config/consts"
import db from "~/helpers/db.server"
import logger from "~/helpers/logger.server"
import { createQueue } from "~/helpers/queue.server"

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
    const purchase = await db.purchase.findUniqueOrThrow({
      where: { id: job.data.purchaseId },
    })

    const item = await db.item.findFirstOrThrow({
      where: {
        commerceId: job.data.item.commerceId,
        listingId: purchase.listingId,
      },
    })

    await db.itemPurchase.create({
      data: {
        cost: job.data.item.cost,
        itemId: item.id,
        purchaseId: purchase.id,
        quantity: job.data.item.quantity,
        total: job.data.item.total,
      },
    })

    await job.log(`Created item purchase ${purchase.id} → ${item.id}`)

    await db.item.update({
      data: {
        stock: { decrement: job.data.item.quantity },
      },
      where: { id: item.id },
    })

    await job.log(
      `Updated item ${item.id} availability: ${item.stock} → ${
        item.stock - job.data.item.quantity
      })`
    )

    await job.log("Finished processing item purchase")
  } catch (error) {
    logger.error((error as Error).message, {
      error,
      jobId: job.id,
      queue: QUEUE_NAMES.CreateItemPurchase,
    })

    throw error
  }
}

export default createQueue(QUEUE_NAMES.CreateItemPurchase, processor)
