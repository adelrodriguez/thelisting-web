import type { Processor } from "bullmq"

import { QUEUE_NAMES } from "~/config/consts"
import db from "~/helpers/db.server"
import logger from "~/helpers/logger.server"
import { createQueue } from "~/helpers/queue.server"
import { NotifyPurchaseQueue } from "~/helpers/queues"
import { getShopifyId } from "~/utils/shopify"

export type QueueData = {
  orderId: string | number
}

export const processor: Processor<QueueData> = async (job) => {
  try {
    const { orderId } = job.data
    const commerceId = getShopifyId(orderId, "Order")

    const purchase = await db.purchase.findFirstOrThrow({
      select: { id: true, paid: true },
      where: { commerceId },
    })

    if (purchase.paid) {
      await job.log(`Purchase ${purchase.id} is already paid. Skipping...`)
      return
    }

    await db.purchase.update({
      data: { paid: true },
      where: { id: purchase.id },
    })

    await job.log(`Purchase ${purchase.id} marked as paid. Notifying user...`)

    await NotifyPurchaseQueue.add(`Purchase ID: ${purchase.id}`, {
      orderId,
    })
  } catch (error) {
    logger.error((error as Error).message, {
      error,
      jobId: job.id,
      queue: QUEUE_NAMES.MarkPurchaseAsPaid,
    })

    throw error
  }
}

export default createQueue(QUEUE_NAMES.MarkPurchaseAsPaid, processor)
