import { CURRENCIES } from "~/config/consts"
import { cleanAmount, cleanText } from "~/utils/scraper"

import { BaseScraper } from "./base"

export default class LaNoviaDeVilla extends BaseScraper {
  static domain = "lanoviadevilla.com"

  public get store(): string | null {
    return "La Novia de Villa"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval('meta[property="og:title"]', (element) =>
        element.getAttribute("content")
      )
      .then((title) => cleanText(title).replace(" - La Novia de Villa", ""))
      .catch((err) => this.logError("title: " + err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval("span.price", (element) => element.textContent)
      .then((amount) => cleanAmount(amount))
      .catch((err) => this.logError("amount: " + err.message))
  }

  public get currency() {
    return CURRENCIES.DOP
  }
}
