import type { Currency } from "~/config/consts"
import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanAmount, cleanCurrency, cleanText } from "~/utils/scraper"

export default class JanieAndJack extends BaseScraper {
  static domain = "janieandjack.com"

  public get store() {
    return "Janie and Jack"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("h1", (element) => element.textContent)
      .then(cleanText)
      .catch((err) => this.logError(err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval("span[itemprop='price']", (element) => element.textContent)
      .then(cleanAmount)
      .catch((err) => this.logError(err.message))
  }

  public get image(): Promise<string | null> {
    return this.page
      .$eval(".amp-main-img", (element) => element.getAttribute("srcset"))
      .then((srcset) => {
        if (!srcset) return null

        const images = srcset.split(", ").map((image) => {
          const parts = image.split(" ")

          // TODO(adelrodriguez): Fix this
          return { size: parseFloat(parts[1]!), url: parts[0] }
        })

        images.sort((a, b) => b.size - a.size)

        return images[0]?.url || null
      })
      .catch((err) => this.logError("image: " + err.message))
  }

  public get currency(): Currency | Promise<Currency | null> {
    return this.page
      .$eval("meta[itemprop='priceCurrency']", (element) =>
        element.getAttribute("content")
      )
      .then(cleanCurrency)
      .catch((err) => this.logError(err.message))
  }
}
