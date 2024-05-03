import type { Currency } from "~/config/consts"
import { CURRENCIES } from "~/config/consts"
import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanAmount, cleanText } from "~/utils/scraper"

export default class EurekaKids extends BaseScraper {
  static domain = "eurekakids.com.do"

  public get store() {
    return "Eureka Kids"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("meta[property='og:title']", (element) => element.getAttribute("content"))
      .then(cleanText)
      .catch((err) => this.logError(err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval("meta[property='og:price:amount']", (element) => element.getAttribute("content"))
      .then(cleanAmount)
      .catch((err) => this.logError(err.message))
  }

  public get currency(): Currency | Promise<Currency | null> {
    return CURRENCIES.DOP
  }
}
