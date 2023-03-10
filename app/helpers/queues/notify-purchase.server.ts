import { flattenConnection } from "@shopify/storefront-kit-react"
import type { Processor } from "bullmq"
import currency from "currency.js"
import invariant from "tiny-invariant"

import { SHOPIFY_SHIPPING_ITEM_1_ID } from "~/config/env.server"
import db from "~/helpers/db.server"
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
    const purchase = await db.purchase.findFirstOrThrow({
      include: { customer: true },
      where: { commerceId: order.id },
    })

    const { listing_id: listingId } = transformCustomAttributes(
      order.customAttributes
    )

    const listing = await db.listing.findUniqueOrThrow({
      include: { owner: true },
      where: { id: listingId! },
    })

    invariant(listing.owner.phone, "Owner phone is missing")

    await whatsapp.sendGiftPurchaseNotification(listing.owner.phone, {
      amount: currency(purchase.cost).format({
        symbol: getPriceSymbol(order.totalPriceSet.shopMoney.currencyCode),
      }),
      buyer: purchase.customer?.name || order.customer?.displayName!,
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
    Sentry.captureException(error)

    throw error
  }
}

export default createQueue("NOTIFY_PURCHASE", processor)
