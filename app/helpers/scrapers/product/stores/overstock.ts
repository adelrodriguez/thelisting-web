import type { Currency } from "~/config/consts"
import { CURRENCIES } from "~/config/consts"
import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanAmount } from "~/utils/scraper"

export default class Overstock extends BaseScraper {
  static domain = "overstock.com"

  public get store() {
    return "Overstock"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("meta[property='og:title']", (element) => element.getAttribute("content"))
      .catch((err) => this.logError(err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval("div[data-testid=current-price]", (element) => element.textContent)
      .then(cleanAmount)
      .catch((err) => this.logError(err.message))
  }

  public get currency(): Currency | Promise<Currency | null> {
    return this.page
      .$eval("div[data-testid=current-price]", (element) => element.textContent)
      .then((currencyString) => {
        if (!currencyString) return null

        if (currencyString.includes(CURRENCIES.DOP)) return CURRENCIES.DOP

        return CURRENCIES.USD
      })
      .catch((err) => this.logError(err.message))
  }
}
