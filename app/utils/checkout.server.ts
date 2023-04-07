import type { PrismaClient } from "@prisma/client"

import type { CartItem } from "~/utils/cart"

export async function checkStock(
  db: PrismaClient,
  cartItem: CartItem
): Promise<boolean> {
  const item = await db.item.findUniqueOrThrow({
    where: { id: cartItem.id },
  })

  return item.stock >= cartItem.quantity
}
