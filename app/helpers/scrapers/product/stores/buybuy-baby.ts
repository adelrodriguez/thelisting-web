import { CURRENCIES } from "~/config/consts"
import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanAmount, cleanText } from "~/utils/scraper"

export default class BuybuyBaby extends BaseScraper {
  static domain = "buybuybaby.com"

  public get store(): string | null {
    return "buybuy BABY"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("meta[property='og:title']", (element) => element.getAttribute("content"))
      .then((text) => text && text.split("|")[0])
      .then(cleanText)
      .catch((err) => this.logError("title: " + err.message))
  }

  public get description(): Promise<string | null> {
    return this.page
      .$eval("meta[property='og:description']", (element) => element.getAttribute("content"))
      .then(cleanText)
      .catch((err) => this.logError("description: " + err.message))
  }

  public get currency() {
    return CURRENCIES.USD
  }

  // TODO(adelrodriguez): This is not working
  public get amount(): Promise<number | null> {
    return this.page
      .$eval('[itemprop="price"]', (element) => element.getAttribute("content"))
      .then(cleanAmount)
      .catch((err) => this.logError("amount: " + err.message))
  }
}
