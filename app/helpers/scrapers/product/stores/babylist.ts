import { CURRENCIES } from "~/config/consts"
import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanAmount } from "~/utils/scraper"

export default class BabylistScraper extends BaseScraper {
  static domain = "babylist.com"

  public get store(): string | null {
    return "Babylist"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("h1", (element) => element.textContent)
      .catch((err) => this.logError("title: " + err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval(".mvs > .h4", (element) => element.textContent)
      .then(cleanAmount)
      .catch((err) => this.logError("amount: " + err.message))
  }

  public get currency() {
    return CURRENCIES.USD
  }
}
