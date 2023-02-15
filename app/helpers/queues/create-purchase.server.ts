import { flattenConnection } from "@shopify/storefront-kit-react"
import type { Processor } from "bullmq"

import prisma from "~/helpers/prisma.server"
import { createQueue } from "~/helpers/queue.server"
import Sentry from "~/services/sentry"
import { GenericError } from "~/utils/error"
import { getShopifyId, transformCustomAttributes } from "~/utils/shopify"
import { getOrder } from "~/utils/shopify.server"

export type QueueData = {
  orderId: string | number
}

export const processor: Processor<QueueData> = async (job) => {
  try {
    const order = await getOrder(getShopifyId(job.data.orderId, "Order"))

    const { listing_id: listingId, note_id: noteId } =
      transformCustomAttributes(order.customAttributes)

    if (!listingId) {
      throw new GenericError({
        code: "listing_id_missing",
        customData: { order },
        message: "Missing custom attribute 'listingId' on order",
      })
    }

    const purchasedItems = flattenConnection(order.lineItems).map(
      (lineItem) => ({
        cost: parseFloat(
          flattenConnection(lineItem.product?.variants)[0]?.inventoryItem
            .unitCost?.amount || 0
        ),
        id: lineItem.product?.id!,
        quantity: lineItem.quantity,
        total: parseFloat(
          flattenConnection(lineItem.product?.variants)[0]!.price
        ),
      })
    )

    const purchase = await prisma.purchase.create({
      data: {
        commerceId: order.id,
        cost: purchasedItems.reduce(
          (acc, item) => acc + item.cost * item.quantity,
          0
        ),
        listingId,
        total: parseFloat(order.totalPriceSet.shopMoney.amount),
      },
    })

    if (noteId) {
      await prisma.note.update({
        data: {
          purchaseId: purchase.id,
        },
        where: { id: noteId },
      })

      job.log(`Updated purchase with note ${noteId}`)
    }

    job.log(`Created purchase ${purchase.id}`)

    // TODO(adelrodriguez): Split this into a separate job
    for (const purchasedItem of purchasedItems) {
      const item = await prisma.item.findFirst({
        where: { commerceId: purchasedItem.id, listingId },
      })

      if (!item) continue

      await prisma.itemPurchase.create({
        data: {
          cost: purchasedItem.cost,
          itemId: item.id,
          purchaseId: purchase.id,
          quantity: purchasedItem.quantity,
          total: purchasedItem.total,
        },
      })

      job.log(`Created item purchase ${item.id} → ${purchase.id}`)

      await prisma.item.update({
        data: {
          stock: { decrement: purchasedItem.quantity },
        },
        where: { id: item.id },
      })

      job.log(
        `Updated item ${item.id} availability: ${item.stock} → ${
          item.stock - purchasedItem.quantity
        })`
      )
    }

    job.log(`Finished processing purchase ${purchase.id}`)

    // TODO(adelrodriguez): Add tags to the order with the listing sku
  } catch (error) {
    Sentry.captureException(error)

    throw error
  }
}

export default createQueue("CREATE_PURCHASE", processor)
