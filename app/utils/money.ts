import { CURRENCIES } from "~/config/consts"

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
