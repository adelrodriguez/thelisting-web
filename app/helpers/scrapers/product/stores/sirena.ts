import { CURRENCIES } from "~/config/consts"
import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanAmount, cleanText } from "~/utils/scraper"

export default class SirenaScraper extends BaseScraper {
  static domain = "sirena.do"

  protected async waitFor() {
    await this.page.waitForSelector("h2")
  }

  public get store(): string | null {
    return "Sirena"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("h2", (element) => element.textContent)
      .catch((err) => this.logError("title: " + err.message))
  }

  public get description(): Promise<string | null> {
    return this.page
      .$eval("p.item-product-title", (element) => element.textContent)
      .then((element) => cleanText(element))
      .then(
        (element) =>
          element &&
          element.replace(
            "Ver términos de servicio y condiciones de la garantía",
            "",
          ),
      )
      .catch((err) => this.logError("description: " + err.message))
  }

  public get image(): Promise<string | null> {
    return this.page
      .$eval("img.iiz__zoom-img", (element) => element.getAttribute("src"))
      .catch((err) => this.logError("image: " + err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval("p.item-product-price", (element) => element.textContent)
      .then(cleanAmount)
      .catch((err) => this.logError("amount: " + err.message))
  }

  public get currency() {
    return CURRENCIES.DOP
  }
}
