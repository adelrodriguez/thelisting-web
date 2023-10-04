import { flattenConnection } from "@shopify/hydrogen-react"
import type { Processor } from "bullmq"
import currency from "currency.js"
import invariant from "tiny-invariant"

import { QUEUE_NAMES } from "~/config/consts"
import { SHOPIFY_SHIPPING_ITEM_1_ID } from "~/config/env.server"
import db from "~/helpers/db.server"
import { createQueue } from "~/helpers/queue.server"
import { WHATSAPP_MESSAGE_TEMPLATES } from "~/services/whatsapp/types"
import { getPriceSymbol } from "~/utils/money"
import { getShopifyId, transformCustomAttributes } from "~/utils/shopify"
import { getOrder } from "~/utils/shopify.server"

import { SendWhatsAppTemplateMessageQueue } from "."

export type QueueData = {
  orderId: string | number
}

export const processor: Processor<QueueData> = async (job) => {
  const order = await getOrder(getShopifyId(job.data.orderId, "Order"))
  const purchase = await db.purchase.findFirstOrThrow({
    include: { customer: true },
    where: { commerceId: order.id },
  })

  const { listing_id: listingId } = transformCustomAttributes(
    order.customAttributes,
  )

  invariant(listingId, "'listingId' is missing")

  const listing = await db.listing.findUniqueOrThrow({
    include: { owner: true },
    where: { id: listingId },
  })

  invariant(listing.owner.phone, "Owner phone is missing")

  await job.log(
    `Sending purchase notification to ${listing.owner.firstName} ${listing.owner.lastName} at ${listing.owner.phone}`,
  )

  const amount = currency(purchase.cost).format({
    symbol: getPriceSymbol(order.totalPriceSet.shopMoney.currencyCode),
  })
  const buyer = purchase.customer?.name || order.customer?.displayName || ""
  const gift = flattenConnection(order.lineItems)
    .filter(
      (lineItem) =>
        flattenConnection(lineItem.product?.variants)[0]?.id !==
        SHOPIFY_SHIPPING_ITEM_1_ID,
    )
    .map((lineItem) => lineItem.product?.title)
    .join(", ")
  const path = `${listing.path}/review`
  const recipient = listing.owner.firstName

  await SendWhatsAppTemplateMessageQueue.add(listing.owner.phone, {
    locale: "ES",
    payload: {
      amount,
      buyer,
      gift,
      path,
      recipient,
    },
    template: WHATSAPP_MESSAGE_TEMPLATES.ListingGiftPurchase,
    to: listing.owner.phone,
  })
}

export default createQueue(QUEUE_NAMES.NotifyPurchase, processor)
