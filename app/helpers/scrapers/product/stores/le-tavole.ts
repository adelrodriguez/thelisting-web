import { CURRENCIES } from "~/config/consts"
import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanAmount, cleanText } from "~/utils/scraper"

export default class LeTavole extends BaseScraper {
  static domain = "letavole.com"

  public get store(): string | null {
    return "Le Tavole"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("h1", (element) => element.textContent)
      .catch((err) => this.logError("title: " + err.message))
  }

  public get description() {
    return this.page
      .$eval(".elementor-toggle-item", (element) => element.textContent)
      .then(cleanText)
      .catch((err) => this.logError("description: " + err.message))
  }

  public get amount() {
    return this.page
      .$eval(".shopengine-product-price", (element) => element.textContent)
      .then(cleanAmount)
      .catch((err) => this.logError("amount: " + err.message))
  }

  public get currency() {
    return CURRENCIES.USD
  }
}
