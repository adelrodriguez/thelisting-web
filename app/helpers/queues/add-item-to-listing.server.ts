import type { Listing } from "@prisma/client"
import type { Processor } from "bullmq"
import crypto from "node:crypto"
import invariant from "tiny-invariant"

import { QUEUE_NAMES } from "~/config/consts"
import db from "~/helpers/db.server"
import { createQueue } from "~/helpers/queue.server"
import {
  calculatePriceWithMargin,
  multiplyPriceByExchangeRate,
} from "~/utils/money"
import {
  addProductsToCollection,
  createProduct,
  getProductsByTag,
  publishToCurrentChannel,
} from "~/utils/shopify.server"

import logger from "../logger.server"

export type QueueData = {
  exchangeRate: number // The exchange rate from USD to DOP
  listingId: Listing["id"]
  margin: number
  rowId: string
  scrapedProductId: string
  quantity: number
}

export const processor: Processor<QueueData> = async (job) => {
  const { scrapedProductId, rowId, listingId, margin, quantity } = job.data

  try {
    // Get listing
    const listing = await db.listing.findUniqueOrThrow({
      where: { id: listingId },
    })

    invariant(
      listing.commerceId,
      `Listing ${listingId} doesn't have a commerceId`
    )

    const scrapedProduct = await db.scrapedProduct.findUniqueOrThrow({
      where: { id: scrapedProductId },
    })

    const sku = `${listing.sku}-${rowId}`

    const existingItem = await db.item.findFirst({
      where: { sku },
    })

    invariant(!existingItem, `Item ${sku} already exists`)

    // Create hashed tag
    const tag = crypto
      .createHash("md5")
      .update(
        `product:${scrapedProduct.url}|amount:${scrapedProduct.amount || 0}`
      )
      .digest("hex")

    await job.log(`Created tag ${tag}`)

    // Look for products with tag
    const shopifyProducts = await getProductsByTag(tag)

    await job.log(`Found ${shopifyProducts.length} product(s) with tag ${tag}`)

    const exchangeRate =
      scrapedProduct.currency === "USD" ? job.data.exchangeRate : 1

    let commerceId: string

    if (shopifyProducts.length === 0) {
      // If product doesn't exist, create it
      const priceMultipledByExchangeRate = multiplyPriceByExchangeRate(
        scrapedProduct.amount || 0,
        exchangeRate
      )

      const shopifyProduct = await createProduct({
        collection: listing.commerceId,
        cost: priceMultipledByExchangeRate,
        currency: scrapedProduct.currency || "DOP",
        description: scrapedProduct.description,
        images: [
          {
            altText: scrapedProduct.title,
            src: scrapedProduct.image,
          },
        ],
        originalAmount: scrapedProduct.amount,
        price: calculatePriceWithMargin(priceMultipledByExchangeRate, margin),
        store: scrapedProduct.store,
        tags: [tag],
        title: scrapedProduct.title,
        url: scrapedProduct.url,
      })

      await job.log(`Created product ${shopifyProduct.id}`)

      const published = await publishToCurrentChannel(shopifyProduct.id)

      await job.log(
        published
          ? `Published product ${shopifyProduct.id}`
          : `Failed to publish product ${shopifyProduct.id}`
      )

      commerceId = shopifyProduct.id
    } else {
      // Since product already exists, let's reuse it
      const [shopifyProduct] = shopifyProducts

      invariant(shopifyProduct, "Shopify product does not exist")
      commerceId = shopifyProduct.id

      await job.log(`Found product ${commerceId}`)

      // Add the product to the listing collection
      await addProductsToCollection(listing.commerceId, [commerceId])
    }

    // Create or update item
    const item = await db.item.upsert({
      create: {
        commerceId,
        listingId: listing.id,
        quantity,
        sku: `${listing.sku}-${rowId}`,
        stock: quantity,
      },
      update: {
        commerceId,
        quantity,
        stock: quantity,
      },
      where: { sku },
    })

    await job.log(`Upsert item ${item.id}`)
  } catch (error) {
    logger.error((error as Error).message, {
      error,
      jobId: job.id,
      queue: QUEUE_NAMES.AddItemToListing,
    })

    throw error
  }
}

export default createQueue(QUEUE_NAMES.AddItemToListing, processor)
