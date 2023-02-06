import { CURRENCIES } from "~/config/consts"
import { cleanText, cleanAmount } from "~/utils/scraper"

import { BaseScraper } from "./base"

export default class TwinkleRDScraper extends BaseScraper {
  static domain = "twinkledr.com"

  public get store(): string | null {
    return "Twinkle RD"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval(".product_title", (element) => element.textContent)
      .then(cleanText)
      .catch((err) => this.logError(err.message))
  }

  public get description(): Promise<string | null> {
    return this.page
      .$eval("meta[property='og:description']", (element) =>
        element.getAttribute("content")
      )
      .then(cleanText)
      .catch((err) => this.logError(err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval(".woocommerce-Price-amount", (element) => element.textContent)
      .then(cleanAmount)
      .catch((err) => this.logError(err.message))
  }

  public get currency() {
    return CURRENCIES.DOP
  }
}
