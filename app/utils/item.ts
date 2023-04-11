import type { Item } from "@prisma/client"

/**
 * This functions sorts the given list of items by stock. Items that are being
 * sold more are listed first. If an item is out of stock, it is listed last.
 */
export function sortByQuantity(itemA: Item, itemB: Item) {
  const itemASold = itemA.quantity - itemA.stock
  const itemBSold = itemB.quantity - itemB.stock

  if (itemA.stock === 0) return 1
  if (itemB.stock === 0) return -1

  return itemBSold - itemASold
}
