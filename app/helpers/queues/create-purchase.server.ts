import { flattenConnection } from "@shopify/hydrogen-react"
import type { Processor } from "bullmq"
import invariant from "tiny-invariant"

import { QUEUE_NAMES } from "~/config/consts"
import { SHOPIFY_SHIPPING_ITEM_1_ID } from "~/config/env.server"
import db from "~/helpers/db.server"
import { createQueue } from "~/helpers/queue.server"
import { CreateItemPurchaseQueue } from "~/helpers/queues"
import { getShopifyId, transformCustomAttributes } from "~/utils/shopify"
import { getOrder } from "~/utils/shopify.server"

export type QueueData = {
  orderId: string | number
}

export const processor: Processor<QueueData> = async (job) => {
  const order = await getOrder(getShopifyId(job.data.orderId, "Order"))

  const { listing_id: listingId, note_id: noteId } = transformCustomAttributes(
    order.customAttributes,
  )

  invariant(listingId, "Missing custom attribute 'listingId' on order")

  const existingPurchase = await db.purchase.findFirst({
    where: { commerceId: order.id },
  })

  if (existingPurchase) {
    await job.log(`Purchase ${existingPurchase.id} already exists. Skipping...`)
    return
  }

  const items = flattenConnection(order.lineItems)
    .filter(
      (lineItem) =>
        flattenConnection(lineItem.product?.variants)[0]?.id !==
        SHOPIFY_SHIPPING_ITEM_1_ID,
    )
    .map((lineItem) => ({
      commerceId: lineItem.product!.id,
      cost: parseFloat(
        flattenConnection(lineItem.product?.variants)[0]?.inventoryItem.unitCost
          ?.amount || 0,
      ),
      quantity: lineItem.quantity,
      total: parseFloat(
        flattenConnection(lineItem.product?.variants)[0]!.price,
      ),
    }))

  invariant(order.customer?.email, "Missing customer email on order")

  const customer = await db.customer.upsert({
    create: {
      commerceId: order.customer?.id,
      email: order.customer?.email,
      name: order.customer?.displayName,
    },
    update: {},
    where: { email: order.customer?.email },
  })

  const purchase = await db.purchase.create({
    data: {
      commerceId: order.id,
      cost: items.reduce((acc, item) => acc + item.cost * item.quantity, 0),
      customerId: customer.id,
      listingId,
      total: parseFloat(order.totalPriceSet.shopMoney.amount),
    },
  })

  if (noteId) {
    await db.note.update({
      data: {
        purchaseId: purchase.id,
      },
      where: { id: noteId },
    })

    await job.log(`Updated purchase with note ${noteId}`)
  }

  await job.log(`Created purchase ${purchase.id}`)

  await job.log(`Queueing ${items.length} item purchases...`)

  await CreateItemPurchaseQueue.addBulk(
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
    })),
  )

  await job.log(`Finished processing purchase ${purchase.id}`)
}

export default createQueue(QUEUE_NAMES.CreatePurchase, processor)
