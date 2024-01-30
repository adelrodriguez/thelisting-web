import type { Item } from "@prisma/client"
import { flattenConnection } from "@shopify/hydrogen-react"
import Redis from "ioredis"
import { z } from "zod"

import { ONE_DAY } from "~/config/consts"

import { generateKey } from "./redis"
import { getProduct } from "./shopify.server"

/**
 * This functions sorts the given list of items by stock. Items that are being
 * sold more are listed first. If an item is out of stock, it is listed last.
 */
export function sortByQuantity<T extends Pick<Item, "quantity" | "stock">>(
  itemA: T,
  itemB: T,
) {
  const itemASold = itemA.quantity - itemA.stock
  const itemBSold = itemB.quantity - itemB.stock

  if (itemA.stock === 0) return 1
  if (itemB.stock === 0) return -1

  return itemBSold - itemASold
}

export const ItemWithDataSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  price: z.coerce.number(),
  title: z.string(),
  variantId: z.string(),
})
export type ItemWithData = z.infer<typeof ItemWithDataSchema>

export async function getItemWithData(
  cache: Redis,
  item: Item,
): Promise<(Item & { data: ItemWithData }) | null> {
  if (!item.commerceId) return null

  const cachedString = await cache.get(
    generateKey("shopify:product", item.commerceId),
  )

  if (cachedString) {
    const cachedResult = ItemWithDataSchema.safeParse(JSON.parse(cachedString))

    if (cachedResult.success) return { ...item, data: cachedResult.data }
  }

  const product = await getProduct(item.commerceId)
  const variant = flattenConnection(product.variants)[0]

  if (!variant) return null

  const result = ItemWithDataSchema.safeParse({
    id: item.id,
    imageUrl: flattenConnection(product.images)[0]?.url,
    price: variant.price,
    title: product.title,
    variantId: variant.id,
  })

  if (!result.success) return null

  await cache.set(
    generateKey("shopify:product", item.commerceId),
    JSON.stringify(result.data),
    "EX",
    ONE_DAY.inSeconds,
  )

  return { ...item, data: result.data }
}
