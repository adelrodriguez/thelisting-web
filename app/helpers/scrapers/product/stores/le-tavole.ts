import { cleanAmount, cleanText } from "~/utils/scraper"

import { BaseScraper } from "./base"

export default class LeTavole extends BaseScraper {
  static domain = "letavole.com"

  public get store(): string | null {
    return "Le Tavole"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("h1", (element) => element.textContent)
      .catch((err) => this.logError("title: " + err.message))
  }

  public get description(): Promise<string | null> {
    return this.page
      .$eval(
        'div[data-widget_type="woocommerce-product-content.default"]',
        (element) => element.textContent
      )
      .then(cleanText)
      .catch((err) => this.logError("description: " + err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval(
        ".elementor-widget-container > p.price",
        (element) => element.textContent
      )
      .then(cleanAmount)
      .catch((err) => this.logError("amount: " + err.message))
  }

  public get currency(): string | Promise<string | null> {
    return "USD"
  }
}
