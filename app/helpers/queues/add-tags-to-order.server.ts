import type { Processor } from "bullmq"

import { QUEUE_NAMES } from "~/config/consts"
import { createQueue } from "~/helpers/queue.server"
import Sentry from "~/services/sentry"
import { GenericError } from "~/utils/error"
import { getShopifyId, transformCustomAttributes } from "~/utils/shopify"
import { addTags, getOrder } from "~/utils/shopify.server"

export type QueueData = {
  orderId: string | number
}

export const processor: Processor<QueueData> = async (job) => {
  try {
    const order = await getOrder(getShopifyId(job.data.orderId, "Order"))

    const { listing_sku: listingSku } = transformCustomAttributes(
      order.customAttributes
    )

    if (!listingSku) {
      throw new GenericError({
        code: "listing_sku_missing",
        customData: { order },
        message: "Missing custom attribute 'listingSku' on order",
      })
    }

    const tags = [listingSku]

    await addTags(order.id, tags)

    job.log(`Added tags "${tags.join(", ")}" to order ${order.id}`)
  } catch (error) {
    Sentry.captureException(error)

    throw error
  }
}

export default createQueue(QUEUE_NAMES.AddTagsToOrder, processor)
