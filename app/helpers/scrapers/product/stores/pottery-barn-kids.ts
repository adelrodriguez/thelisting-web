import type { Currency } from "~/config/consts"
import { CURRENCIES } from "~/config/consts"
import { cleanAmount, cleanText } from "~/utils/scraper"

import { BaseScraper } from "./base"

export default class PotteryBarnKidsScraper extends BaseScraper {
  static domain = "potterybarnkids.com"

  public get store(): string | null {
    return "Pottery Barn Kids"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("title", (element) => element.textContent)
      .then(cleanText)
      .catch((err) => this.logError("title: " + err.message))
  }

  public get description(): Promise<string | null> {
    return this.page
      .$eval("meta[name='description']", (element) =>
        element.getAttribute("content")
      )
      .then(cleanText)
      .catch((err) => this.logError("description: " + err.message))
  }

  public get image(): Promise<string | null> {
    return this.page
      .$eval("#hero-0", (element) => element.getAttribute("srcset"))
      .then((srcset) => srcset!.split(",").pop()!.trim().split(" ")[0]!)
      .catch((err) => this.logError("image: " + err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval(".product-pricing", (element) => element.textContent)
      .then(cleanAmount)
      .catch((err) => this.logError("price: " + err.message))
  }

  public get currency(): Currency | Promise<Currency | null> {
    return CURRENCIES.USD
  }
}
