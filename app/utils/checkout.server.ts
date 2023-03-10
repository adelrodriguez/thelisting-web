import db from "~/helpers/db.server"
import type { CartItem } from "~/utils/cart"

export async function checkStock(cartItem: CartItem): Promise<boolean> {
  const item = await db.item.findUniqueOrThrow({
    where: { id: cartItem.id },
  })

  return item.stock >= cartItem.quantity
}
