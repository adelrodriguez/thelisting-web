import { z } from "zod"

import { SHIPPING_FEE } from "~/config/consts"
import Storage from "~/helpers/storage"

export const CartItemSchema = z.object({
  commerceId: z.string(),
  id: z.string(),
  price: z.number().min(0),
  quantity: z.number().min(1),
  variantId: z.string(),
})
export type CartItem = z.infer<typeof CartItemSchema>

export const CartItemsSchema = z.array(CartItemSchema)

export function calculateSubtotal(cartItems: CartItem[]): number {
  return cartItems.reduce((subtotal, cartItem) => {
    return subtotal + cartItem.price * cartItem.quantity
  }, 0)
}

export function calculateShipping(subtotal: number): number {
  if (!subtotal) return 0

  return SHIPPING_FEE
}

export function clearCart(listingId: string): boolean {
  const storage = new Storage("local")

  const carts = storage.get<Map<string, unknown>>("carts")

  if (!carts) return false

  const result = carts.delete(listingId)

  if (!result) return result

  storage.set("carts", carts)

  return true
}
