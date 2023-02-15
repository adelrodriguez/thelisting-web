import { flattenConnection } from "@shopify/storefront-kit-react"
import type { Processor } from "bullmq"

import { SHOPIFY_SHIPPING_ITEM_1_ID } from "~/config/env.server"
import prisma from "~/helpers/prisma.server"
import { createQueue } from "~/helpers/queue.server"
import { createItemPurchaseQueue } from "~/helpers/queues"
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

    const items = flattenConnection(order.lineItems)
      .filter(
        (lineItem) =>
          flattenConnection(lineItem.product?.variants)[0]?.id !==
          SHOPIFY_SHIPPING_ITEM_1_ID
      )
      .map((lineItem) => ({
        commerceId: lineItem.product?.id!,
        cost: parseFloat(
          flattenConnection(lineItem.product?.variants)[0]?.inventoryItem
            .unitCost?.amount || 0
        ),
        quantity: lineItem.quantity,
        total: parseFloat(
          flattenConnection(lineItem.product?.variants)[0]!.price
        ),
      }))

    const purchase = await prisma.purchase.create({
      data: {
        commerceId: order.id,
        cost: items.reduce((acc, item) => acc + item.cost * item.quantity, 0),
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

    job.log(`Queueing ${items.length} item purchases...`)

    await createItemPurchaseQueue.addBulk(
      items.map((item) => ({
        data: {
          item,
          purchaseId: purchase.id,
        },
        name: `${item.commerceId}`,
        opts: {
          attempts: 7,
          backoff: {
            delay: 1000,
            type: "exponential",
          },
        },
      }))
    )

    job.log(`Finished processing purchase ${purchase.id}`)
    // TODO(adelrodriguez): Add tags to the order with the listing sku
  } catch (error) {
    Sentry.captureException(error)

    throw error
  }
}

export default createQueue("CREATE_PURCHASE", processor)
