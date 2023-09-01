import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanText } from "~/utils/scraper"

export default class PehrScraper extends BaseScraper {
  static domain = "pehr.com"

  public get store(): string | null {
    return "Pehr"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval(".cProductMain-title", (element) => element.textContent)
      .then(cleanText)
      .catch((err) => this.logError("title: " + err.message))
  }
}
