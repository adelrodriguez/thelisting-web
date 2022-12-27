import currency from "currency.js"

/**
 *
 * @param total The order total
 * @param transaction The transaction fee percentage in decimal form
 * @param markup The shipping fee percentage in decimal form
 */
export function calculateFees(
  total: number,
  transaction: number,
  markup: number
): {
  markupFee: number
  transactionFee: number
  subtotal: number
} {
  const subtotal = calculateSubtotal(total, transaction, markup)
  const markupFee = currency(subtotal).multiply(markup).value
  const transactionFee = currency(subtotal)
    .add(markupFee)
    .multiply(transaction).value

  return {
    markupFee,
    subtotal,
    transactionFee,
  }
}

function calculateSubtotal(
  total: number,
  transaction: number,
  markup: number
): number {
  return currency(total)
    .divide(1 + transaction)
    .divide(1 + markup).value
}
