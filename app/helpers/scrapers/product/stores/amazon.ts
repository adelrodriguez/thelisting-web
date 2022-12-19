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
      .evaluate(() => {
        // First, if there's a discount, try to get the original price
        const element1 = document.querySelector(
          '[data-a-strike="true"] > .a-offscreen'
        )

        if (element1) return element1.textContent

        // Otherwise, try to fetch the original price
        const element2 = document.querySelector("span.a-price > .a-offscreen")

        if (element2) return element2?.textContent

        // If neither of those work, return null to throw an error
        return null
      })
      .then(cleanAmount)
      .catch((err) => this.logError("amount: " + err.message))
  }

  public get currency(): string {
    return "USD"
  }
}
