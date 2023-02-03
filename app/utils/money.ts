import currency from "currency.js"

import { CURRENCIES } from "~/config/consts"

export function getPriceSymbol(currencyCode?: string): string {
  switch (currencyCode) {
    case CURRENCIES.dop:
      return "RD$ "
    case CURRENCIES.usd:
      return "US$ "
    default:
      return "$"
  }
}

export function calculatePricePlusMargin(
  price: number,
  margin: number
): number {
  return currency(price).divide((100 - margin) / 100).value
}

export function calculatePriceMinusMargin(
  price: number,
  margin: number
): number {
  return currency(price).multiply((100 - margin) / 100).value
}
