import { flattenConnection } from "@shopify/hydrogen-react"
import type { Processor } from "bullmq"
import currency from "currency.js"
import invariant from "tiny-invariant"

import { QUEUE_NAMES } from "~/config/consts"
import { SHOPIFY_SHIPPING_ITEM_1_ID } from "~/config/env.server"
import { isDevelopment } from "~/config/vars"
import db from "~/helpers/db.server"
import logger from "~/helpers/logger.server"
import { createQueue } from "~/helpers/queue.server"
import whatsapp from "~/services/whatsapp.server"
import { getPriceSymbol } from "~/utils/money"
import { getShopifyId, transformCustomAttributes } from "~/utils/shopify"
import { getOrder } from "~/utils/shopify.server"

export type QueueData = {
  orderId: string | number
}

export const processor: Processor<QueueData> = async (job) => {
  try {
    if (isDevelopment) {
      await job.log("Development mode, skipping")
      return
    }

    const order = await getOrder(getShopifyId(job.data.orderId, "Order"))
    const purchase = await db.purchase.findFirstOrThrow({
      include: { customer: true },
      where: { commerceId: order.id },
    })

    const { listing_id: listingId } = transformCustomAttributes(
      order.customAttributes
    )

    invariant(listingId, "'listingId' is missing")

    const listing = await db.listing.findUniqueOrThrow({
      include: { owner: true },
      where: { id: listingId },
    })

    invariant(listing.owner.phone, "Owner phone is missing")

    await job.log(
      `Sending purchase notification to ${listing.owner.firstName} ${listing.owner.lastName} at ${listing.owner.phone}`
    )

    await whatsapp.sendGiftPurchaseNotification(listing.owner.phone, {
      amount: currency(purchase.cost).format({
        symbol: getPriceSymbol(order.totalPriceSet.shopMoney.currencyCode),
      }),
      buyer: purchase.customer?.name || order.customer?.displayName || "",
      gift: flattenConnection(order.lineItems)
        .filter(
          (lineItem) =>
            flattenConnection(lineItem.product?.variants)[0]?.id !==
            SHOPIFY_SHIPPING_ITEM_1_ID
        )
        .map((lineItem) => lineItem.product?.title)
        .join(", "),
      path: `${listing.path}/review`,
      recipient: listing.owner.firstName,
    })
  } catch (error) {
    logger.error((error as Error).message, {
      error,
      jobId: job.id,
      queue: QUEUE_NAMES.NotifyPurchase,
    })

    throw error
  }
}

export default createQueue(QUEUE_NAMES.NotifyPurchase, processor)
