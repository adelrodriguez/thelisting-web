import type { Processor } from "bullmq"
import currency from "currency.js"

import prisma from "~/helpers/prisma.server"
import { createQueue } from "~/helpers/queue.server"
import Sentry from "~/services/sentry"
import whatsapp from "~/services/whatsapp.server"
import { getPriceSymbol } from "~/utils/money"
import { getShopifyId, transformCustomAttributes } from "~/utils/shopify"
import { getOrder } from "~/utils/shopify.server"

export type QueueData = {
  orderId: string | number
}

export const processor: Processor<QueueData> = async (job) => {
  try {
    const order = await getOrder(getShopifyId(job.data.orderId, "Order"))

    const { listing_id: listingId } = transformCustomAttributes(
      order.customAttributes
    )

    const listing = await prisma.listing.findUniqueOrThrow({
      include: { owner: true },
      where: { id: listingId! },
    })

    if (!listing.owner.phone) {
      throw new Error("Owner phone is missing")
    }

    await whatsapp.sendGiftPurchaseNotification(listing.owner.phone, {
      // TODO(adelrodriguez): Format amount to remove margin
      amount: currency(order.totalPriceSet.shopMoney.amount).format({
        symbol: getPriceSymbol(order.totalPriceSet.shopMoney.currencyCode),
      }),
      buyer: order.customer?.displayName!,
      gift: order.lineItems.nodes
        // TODO(adelrodriguez): Remove shipping item more elegantly. Probably
        // use the variantId to filter it out
        .filter((node) => !node.product?.title.includes("Gestión y Entrega"))
        .map((node) => node.product?.title)
        .join(", "),
      // TODO: Add link to order
      path: "pending",
      recipient: listing.owner.firstName,
    })
  } catch (error) {
    Sentry.captureException(error)

    throw error
  }
}

export default createQueue("NOTIFY_PURCHASE", processor)
