import type { Currency } from "~/config/consts"
import { CURRENCIES } from "~/config/consts"
import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanAmount, cleanText } from "~/utils/scraper"

export default class TargetScraper extends BaseScraper {
  static domain = "target.com"

  protected async waitFor() {
    // TODO(adelrodriguez): Find a better way to wait for the page to load
    // Might be worthwhile to look at which elements are loaded with JS
    await this.page.waitForLoadState("networkidle")
  }

  public get store(): string | null {
    return "Target"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("meta[property='og:title']", (element) =>
        element.getAttribute("content")
      )
      .then(cleanText)
      .catch((err) => this.logError("title: " + err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval(
        "span[data-test='product-price']",
        (element) => element.textContent
      )
      .then(cleanAmount)
      .catch((err) => this.logError("amount: " + err.message))
  }

  public get currency(): Currency | Promise<Currency | null> {
    return CURRENCIES.USD
  }
}
