// cProductMain-title
import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanText } from "~/utils/scraper"

export default class KyteBabyScraper extends BaseScraper {
  static domain = "kytebaby.com"

  public get store(): string | null {
    return "Kyte Baby"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("title", (element) => element.textContent)
      .then(cleanText)
      .catch((err) => this.logError("title: " + err.message))
  }
}
