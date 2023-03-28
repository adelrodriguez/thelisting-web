import type { Processor } from "bullmq"

import { QUEUE_NAMES, REDIS_KEYS } from "~/config/consts"
import redis from "~/helpers/cache.server"
import Sentry from "~/services/sentry"
import { GenericError } from "~/utils/error"
import { generateKey } from "~/utils/redis"
import { getShopifyId } from "~/utils/shopify"
import { getOrderCustomAttributes } from "~/utils/shopify.server"

import { createQueue } from "../queue.server"

export type QueueData = {
  orderId: string | number
}

export const processor: Processor<QueueData> = async (job) => {
  try {
    const customAttributes = await getOrderCustomAttributes(
      getShopifyId(job.data.orderId, "Order")
    )

    const { session_carts_key: cartsKey, listing_id: listingId } =
      customAttributes

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

    const response = await redis.del(
      generateKey(REDIS_KEYS.Cart, cartsKey, listingId)
    )

    job.log(
      `Deleted cart ${generateKey(
        "cart",
        cartsKey,
        listingId
      )} from Redis: ${Boolean(response)}`
    )
  } catch (error) {
    Sentry.captureException(error)

    throw error
  }
}

export default createQueue(QUEUE_NAMES.ClearCart, processor)
