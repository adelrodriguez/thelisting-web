import type { Processor } from "bullmq"
import { format, subMinutes } from "date-fns"

import { QUEUE_NAMES } from "~/config/consts"
import {
  ADMIN_PHONE_NUMBER,
  SHOPIFY_STORE,
  TWILIO_PHONE_NUMBER,
} from "~/config/env.server"
import db from "~/helpers/db.server"
import { createQueue } from "~/helpers/queue.server"
import Sentry from "~/services/sentry"
import twilio from "~/services/twilio.server"
import { getShopifyIdNumber } from "~/utils/shopify"

export const processor: Processor = async (job) => {
  try {
    const abandonedCheckouts = await db.checkout.findMany({
      where: {
        completedAt: null,
        notified: false,
        updatedAt: {
          lte: subMinutes(new Date(), 14),
        },
      },
    })

    job.log(`Found ${abandonedCheckouts.length} abandoned checkouts`)
    job.log("Notifying about abandoned checkouts...")

    for (const checkout of abandonedCheckouts) {
      const message = await twilio.messages.create({
        body: `Customer has abandoned their checkout at: ${format(
          checkout.updatedAt,
          "hh:mm aa"
        )}\n\nName: ${checkout.name}\nEmail: ${checkout.email}\nPhone: ${
          checkout.phone
        }\n\nMore details: https://admin.shopify.com/store/${SHOPIFY_STORE}/checkouts/${getShopifyIdNumber(
          checkout.commerceId!
        )}`,
        from: TWILIO_PHONE_NUMBER,
        to: ADMIN_PHONE_NUMBER,
      })

      job.log(`Sent message ${message.sid}`)

      await db.checkout.update({
        data: {
          notified: true,
        },
        where: {
          id: checkout.id,
        },
      })
    }
  } catch (error) {
    Sentry.captureException(error)

    throw error
  }
}

export default createQueue(
  QUEUE_NAMES.AutomatedAbandonedCheckoutsNotification,
  processor
)
