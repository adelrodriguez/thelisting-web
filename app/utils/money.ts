import currency from "currency.js"
import { z } from "zod"

import { CURRENCIES } from "~/config/consts"

export const CurrencySchema = z
  .enum([CURRENCIES.DOP, CURRENCIES.USD])
  .catch(CURRENCIES.DOP)

export function getPriceSymbol(currencyCode?: string): string {
  switch (currencyCode) {
    case CURRENCIES.DOP:
      return "RD$ "
    case CURRENCIES.USD:
      return "US$ "
    default:
      return "$"
  }
}

export function calculatePriceWithMargin(
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

export function multiplyPriceByExchangeRate(
  price: number,
  exchangeRate: number
): number {
  return currency(price).multiply(exchangeRate).value
}
