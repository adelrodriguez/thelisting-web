import { flattenConnection } from "@shopify/storefront-kit-react"
import type { Processor } from "bullmq"

import Sentry from "~/services/sentry"
import { GenericError } from "~/utils/error"
import { getShopifyId } from "~/utils/shopify"
import { getOrder } from "~/utils/shopify.server"

import prisma from "../prisma.server"
import { createQueue } from "../queue.server"

export type QueueData = {
  orderId: string | number
}

export const processor: Processor<QueueData> = async (job) => {
  try {
    const order = await getOrder(getShopifyId(job.data.orderId, "Order"))

    const listingId = order.tags[0]

    if (!listingId) {
      throw new GenericError({
        code: "listing_id_missing",
        customData: { order },
        message: "Missing tag 'listingId' on order",
      })
    }

    const purchasedItems = flattenConnection(order.lineItems).map(
      (lineItem) => ({
        id: lineItem.product?.id!,
        quantity: lineItem.quantity,
      })
    )

    const purchase = await prisma.purchase.create({
      data: {
        amount: Number(order.totalPriceSet.shopMoney.amount),
        commerceId: order.id,
        listingId,
        note: order.note,
      },
    })

    job.log(`Created purchase ${purchase.id}`)

    for (const purchasedItem of purchasedItems) {
      const item = await prisma.item.findFirst({
        where: { commerceId: purchasedItem.id, listingId },
      })

      if (!item) continue

      await prisma.item.update({
        data: {
          available: { decrement: purchasedItem.quantity },
        },
        where: { id: item.id },
      })

      job.log(
        `Updated item ${item.id} availability: ${item.available} → ${
          item.available - purchasedItem.quantity
        })`
      )

      await prisma.itemPurchase.create({
        data: {
          itemId: item.id,
          purchaseId: purchase.id,
          quantity: purchasedItem.quantity,
        },
      })

      job.log(`Created item purchase ${item.id} → ${purchase.id}`)
    }

    job.log(`Finished processing purchase ${purchase.id}`)
  } catch (error) {
    Sentry.captureException(error)

    throw error
  }
}

export default createQueue("CREATE_PURCHASE", processor)
