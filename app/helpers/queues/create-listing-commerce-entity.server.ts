import type { Processor } from "bullmq"

import { QUEUE_NAMES } from "~/config/consts"
import db from "~/helpers/db.server"
import { createQueue } from "~/helpers/queue.server"
import {
  createCollection,
  publishToCurrentChannel,
} from "~/utils/shopify.server"

export type QueueData = {
  listingId: string
}

export const processor: Processor<QueueData> = async (job) => {
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

  await job.log(`Updated listing ${listingId} with commerceId ${collection.id}`)

  const published = await publishToCurrentChannel(collection.id)

  if (!published) {
    throw new Error(`Failed to publish collection ${collection.id}`)
  }

  await job.log(`Published collection ${collection.id}`)
}

export default createQueue(QUEUE_NAMES.CreateListingCommerceEntity, processor)
