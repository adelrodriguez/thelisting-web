import type { Processor } from "bullmq"

import { QUEUE_NAMES, REDIS_KEYS } from "~/config/consts"
import redis from "~/helpers/cache.server"
import { createQueue } from "~/helpers/queue.server"
import { GenericError } from "~/utils/error"
import { generateKey } from "~/utils/redis"
import { getShopifyId } from "~/utils/shopify"
import { getOrderCustomAttributes } from "~/utils/shopify.server"

export type QueueData = {
  orderId: string | number
}

export const processor: Processor<QueueData> = async (job) => {
  const customAttributes = await getOrderCustomAttributes(getShopifyId(job.data.orderId, "Order"))

  const { listing_id: listingId, session_carts_key: cartsKey } = customAttributes

  if (!cartsKey) {
    throw new GenericError({
      code: "session_carts_key_missing",
      customData: { customAttributes },
      message: "Missing custom attribute 'cartsKey' on order",
    })
  }

  if (!listingId) {
    throw new GenericError({
      code: "listing_id_missing",
      customData: { customAttributes },
      message: "Missing custom attribute 'listingId' on order",
    })
  }

  const key = generateKey(REDIS_KEYS.Cart, cartsKey, listingId)

  const response = await redis.del(key)

  await job.log(`Deleted cart ${key} from Redis: ${Boolean(response)}`)
}

export default createQueue(QUEUE_NAMES.ClearCart, processor)
