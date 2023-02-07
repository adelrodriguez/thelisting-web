import { CURRENCIES } from "~/config/consts"
import { cleanAmount, cleanText } from "~/utils/scraper"

import { BaseScraper } from "./base"

export default class AmazonScraper extends BaseScraper {
  static domain = "amazon.com"

  public get store(): string | null {
    return "Amazon"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("span#productTitle", (element) => element.textContent)
      .then(cleanText)
      .catch((err) => this.logError("title: " + err.message))
  }

  public get image(): Promise<string | null> {
    return this.page
      .$eval("img.a-dynamic-image", (element) => element.getAttribute("src"))
      .catch((err) => this.logError("image: " + err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval(
        [
          '[data-a-strike="true"] > .a-offscreen',
          "span.a-price > .a-offscreen",
          "#sns-base-price",
        ].join(","),
        (element) => element.textContent
      )
      .then(cleanAmount)
      .catch((err) => this.logError("amount: " + err.message))
  }

  public get currency() {
    return CURRENCIES.USD
  }
}
