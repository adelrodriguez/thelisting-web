import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanText } from "~/utils/scraper"

export default class Pandaretta extends BaseScraper {
  static domain = "panderettabordados.com"

  protected async waitFor() {
    await this.page.waitForSelector("h1")
  }

  public get store(): string | null {
    return "Panderetta Bordados"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("meta[property='og:title']", (element) =>
        element.getAttribute("content"),
      )
      .then(cleanText)
      .catch((err) => this.logError("title: " + err.message))
  }
}
