import prisma from "~/helpers/prisma.server"
import type { CartItem } from "~/utils/cart"

export async function checkStock(cartItem: CartItem): Promise<boolean> {
  const item = await prisma.item.findUniqueOrThrow({
    where: { id: cartItem.id },
  })

  return item.stock >= cartItem.quantity
}
