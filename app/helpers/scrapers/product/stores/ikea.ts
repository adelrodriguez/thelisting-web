import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanText } from "~/utils/scraper"

export default class IkeaScraper extends BaseScraper {
  static domain = "ikea.com.do"

  public get store(): string {
    return "Ikea"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("div.itemFacts", (element) => element.textContent)
      .then(cleanText)
      .catch((err) => this.logError("title: " + err.message))
  }

  public get description(): Promise<string | null> {
    return this.page
      .$eval("div.itemFacts", (element) => element.textContent)
      .then(cleanText)
      .catch((err) => this.logError("description: " + err.message))
  }

  public get image(): Promise<string | null> {
    return this.page
      .$eval("div.slideItem.active", (element) =>
        element.getAttribute("data-url")
      )
      .catch((err) => this.logError("image: " + err.message))
  }
}
