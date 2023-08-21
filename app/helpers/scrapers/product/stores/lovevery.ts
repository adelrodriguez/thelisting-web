import type { Currency } from "~/config/consts"
import { CURRENCIES } from "~/config/consts"
import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanAmount, cleanText } from "~/utils/scraper"

export default class Lovevery extends BaseScraper {
  static domain = "lovevery.com"

  public get store() {
    return "Lovevery"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("meta[property='og:title']", (element) =>
        element.getAttribute("content")
      )
      .then(cleanText)
      .catch((err) => this.logError(err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval("meta[property='og:price:amount']", (element) =>
        element.getAttribute("content")
      )
      .then(cleanAmount)
      .catch((err) => this.logError(err.message))
  }

  public get currency(): Currency | Promise<Currency | null> {
    return CURRENCIES.USD
  }
}
