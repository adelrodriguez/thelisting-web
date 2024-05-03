import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanText } from "~/utils/scraper"

export default class TiendaMaryScraper extends BaseScraper {
  static domain = "tiendamary.com"

  public get title(): Promise<string | null> {
    return this.page
      .$eval('meta[property="og:title"]', (element) => element.getAttribute("content"))
      .then((title) => cleanText(title))
      .catch((err) => this.logError("title: " + err.message))
  }

  public get description(): Promise<string | null> {
    return this.page
      .$eval('meta[property="og:description"]', (element) => element.getAttribute("content"))
      .then((description) => (description ? cleanText(description) : ""))
      .catch((err) => this.logError("description: " + err.message))
  }

  public get store(): string | null {
    return "Tienda Mary"
  }
}
