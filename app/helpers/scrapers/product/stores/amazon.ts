import { CURRENCIES } from "~/config/consts"
import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanAmount, cleanText } from "~/utils/scraper"

export default class AmazonScraper extends BaseScraper {
  static domain = "amazon.com"

  protected async waitFor(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded")
  }

  public get store(): string | null {
    return "Amazon"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("h1#title", (element) => element.textContent)
      .then(cleanText)
      .catch((err) => this.logError("title: " + err.message))
  }

  public get image(): Promise<string | null> {
    return this.page
      .$eval("#landingImage", (element) => element.getAttribute("src"))
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
