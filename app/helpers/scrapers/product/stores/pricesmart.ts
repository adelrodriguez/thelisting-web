import { BaseScraper } from "~/helpers/scrapers/product/base.server"

export default class PricesmartScraper extends BaseScraper {
  static domain = "pricesmart.com"

  public get store(): string | null {
    return "PriceSmart"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("meta[property='og:title']", (element) => element.getAttribute("content"))
      .catch((err) => this.logError("title: " + err.message))
  }
}
