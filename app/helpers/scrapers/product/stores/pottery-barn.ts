import type { Currency } from "~/config/consts"
import { CURRENCIES } from "~/config/consts"
import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanAmount, cleanText } from "~/utils/scraper"

export default class PotteryBarnScraper extends BaseScraper {
  static domain = "potterybarn.com"

  public get store(): string | null {
    return "Pottery Barn"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("title", (element) => element.textContent)
      .then(cleanText)
      .then((text) => text.replace(" | Pottery Barn", ""))
      .catch((err) => this.logError("title: " + err.message))
  }

  public get image(): Promise<string | null> {
    return (
      this.page
        .$eval("#hero-0", (element) => element.getAttribute("srcset"))
        // TODO(adelrodriguez): Remove non-null assertion
        .then((srcset) => srcset!.split(",").pop()!.trim().split(" ")[0]!)
        .catch((err) => this.logError("image: " + err.message))
    )
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval(".amount", (element) => element.textContent)
      .then(cleanAmount)
      .catch((err) => this.logError("price: " + err.message))
  }

  public get currency(): Currency | Promise<Currency | null> {
    return CURRENCIES.USD
  }
}
