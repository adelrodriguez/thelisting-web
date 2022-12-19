import { cleanAmount } from "~/utils/scraper"

import { BaseScraper } from "./base"

export default class BabylistScraper extends BaseScraper {
  static domain = "babylist.com"

  public get store(): string | null {
    return "Babylist"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval('span[itemprop="name"]', (element) => element.textContent)
      .catch((err) => this.logError("title: " + err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval('span[itemprop="price"]', (element) => element.textContent)
      .then(cleanAmount)
      .catch((err) => this.logError("amount: " + err.message))
  }

  public get currency(): Promise<string | null> {
    return Promise.resolve("USD")
  }
}
