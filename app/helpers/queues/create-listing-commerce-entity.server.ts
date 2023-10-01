import type { Processor } from "bullmq"

import { QUEUE_NAMES } from "~/config/consts"
import db from "~/helpers/db.server"
import logger from "~/helpers/logger.server"
import { createQueue } from "~/helpers/queue.server"
import Sentry from "~/services/sentry"
import {
  createCollection,
  publishToCurrentChannel,
} from "~/utils/shopify.server"

export type QueueData = {
  listingId: string
}

export const processor: Processor<QueueData> = async (job) => {
  try {
    const listingId = job.data.listingId

    const listing = await db.listing.findUniqueOrThrow({
      where: { id: listingId },
    })

    const collection = await createCollection({
      sku: listing.sku,
    })

    await job.log(`Created collection ${collection.id}`)

    await db.listing.update({
      data: { commerceId: collection.id },
      where: { id: listingId },
    })

    await job.log(
      `Updated listing ${listingId} with commerceId ${collection.id}`,
    )

    const published = await publishToCurrentChannel(collection.id)

    await job.log(
      published
        ? `Published collection ${collection.id}`
        : `Failed to publish collection ${collection.id}`,
    )
  } catch (error) {
    Sentry.captureException(error)

    logger.error((error as Error).message, {
      error,
      jobId: job.id,
      queue: QUEUE_NAMES.CreateListingCommerceEntity,
    })

    throw error
  }
}

export default createQueue(QUEUE_NAMES.CreateListingCommerceEntity, processor)
