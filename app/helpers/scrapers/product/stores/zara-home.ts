import { cleanAmount, cleanText } from "~/utils/scraper"

import { BaseScraper } from "./base"

export default class ZaraHome extends BaseScraper {
  static domain = "zarahome.com"

  protected async waitFor() {
    await this.page.waitForLoadState("networkidle")
  }

  public get store(): string | null {
    return "Zara Home"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("h2", (element) => element.textContent)
      .then(cleanText)
      .catch((err) => this.logError("title: " + err.message))
  }

  public get description(): Promise<string | null> {
    return this.page
      .$eval(
        "#product-description-paragraphs",
        (element) => element.textContent
      )
      .then(cleanText)
      .catch((err) => this.logError("description: " + err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval(".price", (element) => element.textContent)
      .then(cleanAmount)
      .catch((err) => this.logError("amount: " + err.message))
  }

  public get currency(): string | Promise<string | null> {
    return "DOP"
  }
}
