import type { Item } from "@prisma/client"
import { z } from "zod"

export type CartItem = Pick<Item, "id" | "title" | "commerceId"> & {
  variantId: string
  quantity: number
  price: number
}
export const cartItemSchema: z.ZodSchema<CartItem> = z.object({
  commerceId: z.string(),
  id: z.string(),
  price: z.number().min(0),
  quantity: z.number().min(1),
  title: z.string(),
  variantId: z.string(),
})
export const cartItemsSchema = z.array(cartItemSchema)

export function calculateSubtotal(cartItems: CartItem[]): number {
  return cartItems.reduce((subtotal, cartItem) => {
    return subtotal + cartItem.price * cartItem.quantity
  }, 0)
}
