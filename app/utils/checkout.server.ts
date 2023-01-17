import currency from "currency.js"

import prisma from "~/helpers/prisma.server"
import type { CartItem } from "~/utils/cart"

export async function checkAvailability(cartItem: CartItem): Promise<boolean> {
  const item = await prisma.item.findUniqueOrThrow({
    where: { id: cartItem.id },
  })

  return item.available >= cartItem.quantity
}

/**
 * @param subtotal The order subtotal
 * @param markupPercentage The markup fee percentage in decimal form
 * @param paymentPercentage The transaction fee percentage in decimal form
 */
export function calculateFees(
  subtotal: number,
  markupPercentage: number,
  paymentPercentage: number
): { markupFee: number; paymentFee: number } {
  if (markupPercentage <= 0 || paymentPercentage <= 0) {
    throw new Error("Markup and payment percentages must be above 0%")
  }

  if (markupPercentage > 1 || paymentPercentage > 1) {
    throw new Error(
      "Markup and payment fees must be a percentage in decimal form and less than 100%"
    )
  }

  const markupFee = currency(subtotal).multiply(markupPercentage)
  const paymentFee = currency(subtotal)
    .add(markupFee)
    .multiply(paymentPercentage)

  return {
    markupFee: markupFee.value,
    paymentFee: paymentFee.value,
  }
}
