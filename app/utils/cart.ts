import { z } from "zod"

import { SHIPPING_FEE } from "~/config/consts"

export const CartItemSchema = z.object({
  commerceId: z.string(),
  id: z.string(),
  price: z.number().min(0),
  quantity: z.number().min(1),
  sku: z.string(),
  variantId: z.string(),
})
export type CartItem = z.infer<typeof CartItemSchema>

export const CartItemsSchema = z.array(CartItemSchema)

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((subtotal, item) => {
    return subtotal + item.price * item.quantity
  }, 0)
}

export function calculateShipping(subtotal: number): number {
  if (!subtotal) return 0

  return SHIPPING_FEE
}

export function calculateItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => {
    return count + item.quantity
  }, 0)
}
