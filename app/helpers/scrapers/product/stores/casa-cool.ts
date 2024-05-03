import { z } from "zod"

import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { CurrencySchema } from "~/utils/money"
import { cleanAmount, cleanText } from "~/utils/scraper"

const applicationSchema = z.object({
  offers: z.object({
    price: z.string(),
    priceCurrency: z.string(),
  }),
})

export default class CasaCool extends BaseScraper {
  static domain = "casacool.shop"

  public get store() {
    return "Casa Cool"
  }

  public get title() {
    return this.page
      .$eval("title", (element) => element.textContent)
      .then((text) => text?.split("–")[0])
      .then(cleanText)
      .catch((err) => this.logError("title: " + err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval('script[type="application/ld+json"]', (element) => element.textContent)
      .then((content) => z.string().parse(content))
      .then((content) => applicationSchema.parse(JSON.parse(content)))
      .then((content) => (content ? content.offers.price : null))
      .then(cleanAmount)
      .catch((err) => this.logError("amount: " + err.message))
  }

  public get currency() {
    return this.page
      .$eval('script[type="application/ld+json"]', (element) => element.textContent)
      .then((content) => z.string().parse(content))
      .then((content) => applicationSchema.parse(JSON.parse(content)))
      .then((content) => (content ? content.offers.priceCurrency : null))
      .then(cleanText)
      .then(CurrencySchema.parse)
      .catch((err) => this.logError("currency: " + err.message))
  }
}
