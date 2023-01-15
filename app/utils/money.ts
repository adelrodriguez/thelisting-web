import currency from "currency.js"

import { CURRENCIES } from "~/config/consts"

/**
 *
 * @param total The order total
 * @param transaction The transaction fee percentage in decimal form
 * @param markup The shipping fee percentage in decimal form
 */
export function calculateFees(
  total: number,
  transaction: number,
  shipping: number
): {
  shippingFee: number
  transactionFee: number
  subtotal: number
} {
  const subtotal = calculateSubtotal(total, transaction, shipping)
  const shippingFee = currency(subtotal).multiply(shipping).value
  const transactionFee = currency(subtotal)
    .add(shippingFee)
    .multiply(transaction).value

  return {
    shippingFee,
    subtotal,
    transactionFee,
  }
}

function calculateSubtotal(
  total: number,
  transaction: number,
  shipping: number
): number {
  return currency(total)
    .divide(1 + transaction)
    .divide(1 + shipping).value
}

export function getPriceSymbol(currencyCode: string): string {
  switch (currencyCode) {
    case CURRENCIES.dop:
      return "RD$"
    case CURRENCIES.usd:
      return "$"
    default:
      return currencyCode
  }
}
