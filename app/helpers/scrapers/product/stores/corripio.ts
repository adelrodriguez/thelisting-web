import { CURRENCIES } from "~/config/consts"
import { cleanAmount, cleanText } from "~/utils/scraper"

import { BaseScraper } from "./base"

export default class CorripioScraper extends BaseScraper {
  static domain = "tiendascorripio.com.do"

  public get store(): string | null {
    return "Corripio"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval('meta[property="og:title"]', (element) =>
        element.getAttribute("content")
      )
      .then((title) => cleanText(title).replace(" — Corripio", ""))
      .catch((err) => this.logError("title: " + err.message))
  }

  public get description(): Promise<string | null> {
    return this.page
      .$eval('meta[property="og:description"]', (element) =>
        element.getAttribute("content")
      )
      .then((title) => cleanText(title).replace(" — Corripio", ""))
      .catch((err) => this.logError("description: " + err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval("span.monto", (title) => title.textContent)
      .then(cleanAmount)
      .catch((err) => this.logError("amount: " + err.message))
  }

  public get currency() {
    return CURRENCIES.DOP
  }
}
