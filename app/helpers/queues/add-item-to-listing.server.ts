import type { Listing } from "@prisma/client"
import type { Processor } from "bullmq"
import { MD5 } from "crypto-js"

import prisma from "~/helpers/prisma.server"
import { createQueue } from "~/helpers/queue.server"
import Sentry from "~/services/sentry"
import { calculatePricePlusMargin } from "~/utils/money"
import type { ScrapeProductsTableRow } from "~/utils/scraper"
import {
  createProduct,
  getProductsByTag,
  publishToCurrentChannel,
} from "~/utils/shopify.server"

export type QueueData = {
  listingId: Listing["id"]
  product: ScrapeProductsTableRow
  margin: number
}

export const processor: Processor<QueueData> = async (job) => {
  const { product, listingId, margin } = job.data

  try {
    // Get listing
    const listing = await prisma.listing.findUniqueOrThrow({
      where: {
        id: listingId,
      },
    })

    const sku = `${listing.sku}-${product.id}`

    // Create hashed tag
    const tag = MD5(
      `product:${job.data.product.url}|amount:${job.data.product.amount}`
    ).toString()

    job.log(`Created tag ${tag}`)

    // Look for products with tag
    const shopifyProducts = await getProductsByTag(tag)

    job.log(`Found ${shopifyProducts.length} product(s) with tag ${tag}`)

    let commerceId: string
    if (shopifyProducts.length === 0) {
      // If product doesn't exist, create it
      const shopifyProduct = await createProduct({
        collection: listing.commerceId,
        currency: product.currency,
        description: product.description,
        images: [
          {
            altText: product.title,
            src: product.image,
          },
        ],
        // TODO(adelrodriguez): Multiply by exchange rate
        price: calculatePricePlusMargin(product.amount || 0, margin),
        store: product.store,
        tags: [tag],
        title: product.title,
      })

      job.log(`Created product ${shopifyProduct.id}`)

      const published = await publishToCurrentChannel(shopifyProduct.id)

      job.log(
        published
          ? `Published product ${shopifyProduct.id}`
          : `Failed to publish product ${shopifyProduct.id}`
      )

      commerceId = shopifyProduct.id
    } else {
      // Since product already exists, let's reuse it
      const shopifyProduct = shopifyProducts[0]!

      job.log(`Found product ${shopifyProduct.id}`)
      commerceId = shopifyProduct.id
    }

    // Create or update item
    const item = await prisma.item.upsert({
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

    job.log(`Upsert item ${item.id}`)
  } catch (error) {
    Sentry.captureException(error)

    throw error
  }
}

export default createQueue("ADD_ITEM_TO_LISTING", processor)
