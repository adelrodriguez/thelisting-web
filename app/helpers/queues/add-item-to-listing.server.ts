import type { Listing } from "@prisma/client"
import type { Processor } from "bullmq"
import crypto from "node:crypto"

import { QUEUE_NAMES } from "~/config/consts"
import db from "~/helpers/db.server"
import { createQueue } from "~/helpers/queue.server"
import {
  calculatePriceWithMargin,
  multiplyPriceByExchangeRate,
} from "~/utils/money"
import { ScrapeProductsTableRow } from "~/utils/scraper"
import {
  addProductsToCollection,
  createProduct,
  getProductsByTag,
  publishToCurrentChannel,
} from "~/utils/shopify.server"

export type QueueData = {
  exchangeRate: number // The exchange rate from USD to DOP
  listingId: Listing["id"]
  margin: number
  product: ScrapeProductsTableRow
}

export const processor: Processor<QueueData> = async (job) => {
  const { listingId, margin, product } = job.data

  // Get listing
  const listing = await db.listing.findUniqueOrThrow({
    where: { id: listingId },
  })

  if (!listing.commerceId) {
    throw new Error(`Listing ${listingId} doesn't have a commerceId`)
  }

  const sku = `${listing.sku}-${product.id}`

  const existingItem = await db.item.findFirst({
    where: { sku },
  })

  if (existingItem) {
    throw new Error(`Item ${sku} already exists`)
  }

  // Create hashed tag
  const tag = crypto
    .createHash("md5")
    .update(`product:${product.url}|amount:${product.amount || 0}`)
    .digest("hex")

  await job.log(`Created tag ${tag}`)

  // Look for products with tag
  const shopifyProducts = await getProductsByTag(tag)

  await job.log(`Found ${shopifyProducts.length} product(s) with tag ${tag}`)

  const exchangeRate = product.currency === "USD" ? job.data.exchangeRate : 1

  let commerceId: string

  if (shopifyProducts.length === 0) {
    // If product doesn't exist, create it
    const priceMultipledByExchangeRate = multiplyPriceByExchangeRate(
      product.amount || 0,
      exchangeRate,
    )

    const shopifyProduct = await createProduct({
      collection: listing.commerceId,
      cost: priceMultipledByExchangeRate,
      currency: product.currency || "DOP",
      description: product.description,
      images: [
        {
          alt: product.title,
          src: product.image,
        },
      ],
      originalAmount: product.amount,
      price: calculatePriceWithMargin(priceMultipledByExchangeRate, margin),
      store: product.store,
      tags: [tag],
      title: product.title,
      url: product.url,
    })

    await job.log(`Created product ${shopifyProduct.id}`)

    const published = await publishToCurrentChannel(shopifyProduct.id)

    await job.log(
      published
        ? `Published product ${shopifyProduct.id}`
        : `Failed to publish product ${shopifyProduct.id}`,
    )

    commerceId = shopifyProduct.id
  } else {
    // Since product already exists, let's reuse it
    const [shopifyProduct] = shopifyProducts

    if (!shopifyProduct) {
      throw new Error("Shopify product does not exist")
    }

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
      quantity: product.quantity,
      sku: `${listing.sku}-${product.id}`,
      stock: product.quantity,
    },
    update: {
      commerceId,
      quantity: product.quantity,
      stock: product.quantity,
    },
    where: { sku },
  })

  await job.log(`Upsert item ${item.id}`)
}

export default createQueue(QUEUE_NAMES.AddItemToListing, processor)
