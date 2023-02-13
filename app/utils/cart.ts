import { z } from "zod"

import { SHIPPING_FEE } from "~/config/consts"

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
