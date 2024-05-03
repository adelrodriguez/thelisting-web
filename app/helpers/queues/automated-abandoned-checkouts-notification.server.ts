import type { Processor } from "bullmq"
import { format, getUnixTime, subMinutes } from "date-fns"

import { QUEUE_NAMES } from "~/config/consts"
import { SHOPIFY_STORE } from "~/config/env.server"
import { isProduction } from "~/config/vars"
import db from "~/helpers/db.server"
import { createQueue } from "~/helpers/queue.server"
import { SendSlackMessageQueue } from "~/helpers/queues"
import { getShopifyIdNumber } from "~/utils/shopify"

export const processor: Processor = async (job) => {
  const abandonedCheckouts = await db.checkout.findMany({
    where: {
      completedAt: null,
      email: {
        not: null,
      },
      notified: false,
      updatedAt: {
        lte: subMinutes(new Date(), 14),
      },
    },
  })

  await job.log(`Found ${abandonedCheckouts.length} abandoned checkouts`)

  if (abandonedCheckouts.length === 0) {
    await job.log("No abandoned checkouts to notify about")
    return
  }

  await job.log("Notifying about abandoned checkouts...")

  for (const checkout of abandonedCheckouts) {
    const timestamp = getUnixTime(checkout.updatedAt)
    const formattedDate = format(checkout.updatedAt, "hh:mm aa zzz")

    await SendSlackMessageQueue.add(checkout.id, {
      channel: "notifications-abandoned-checkouts",
      text: `${
        isProduction ? ":warning:" : "(Development)"
      } Customer has abandoned their checkout. Last update: <!date^${timestamp}^{time}|${formattedDate}>.\n\nName: ${
        checkout.name
      }\nEmail: ${checkout.email}\nPhone: ${
        checkout.phone
      }\n\nMore details: https://admin.shopify.com/store/${SHOPIFY_STORE}/checkouts/${getShopifyIdNumber(
        checkout.commerceId ?? "",
      )}`,
    })

    await job.log(`Sent notification for: ${checkout.email}`)

    await db.checkout.update({
      data: {
        notified: true,
      },
      where: {
        id: checkout.id,
      },
    })
  }
}

export default createQueue(QUEUE_NAMES.AutomatedAbandonedCheckoutsNotification, processor)
