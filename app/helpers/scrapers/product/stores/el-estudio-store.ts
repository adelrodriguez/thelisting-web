import { cleanText, cleanAmount } from "~/utils/scraper"

import { BaseScraper } from "./base"

export default class ElEstudioStore extends BaseScraper {
  static domain = "elestudiostore.com"

  public get store(): string {
    return "ElEstudioStore"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("title", (element) => element.textContent)
      .then((text) => text?.split("–")[0])
      .then(cleanText)
      .catch((err) => this.logError(err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval(".money", (element) => element.textContent)
      .then(cleanAmount)
      .catch((err) => this.logError(err.message))
  }

  public get currency(): string | Promise<string | null> {
    return "DOP"
  }
}
