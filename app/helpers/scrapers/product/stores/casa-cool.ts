import { cleanText, cleanAmount, CurrencySchema } from "~/utils/scraper"

import { BaseScraper } from "./base"

export default class CasaCool extends BaseScraper {
  static domain = "casacool.shop"

  public get store(): string {
    return "Casa Cool"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("title", (element) => element.textContent)
      .then((text) => text?.split("–")[0])
      .then(cleanText)
      .catch((err) => this.logError("title: " + err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval(
        'script[type="application/ld+json"]',
        (element) => element.textContent
      )
      .then((content) => content && JSON.parse(content))
      .then((content) => content.offers.price)
      .then(cleanAmount)
      .catch((err) => this.logError("amount: " + err.message))
  }

  public get currency() {
    return this.page
      .$eval(
        'script[type="application/ld+json"]',
        (element) => element.textContent
      )
      .then((content) => content && JSON.parse(content))
      .then((content) => content.offers.priceCurrency)
      .then(cleanText)
      .then(CurrencySchema.parse)
      .catch((err) => this.logError("currency: " + err.message))
  }
}
