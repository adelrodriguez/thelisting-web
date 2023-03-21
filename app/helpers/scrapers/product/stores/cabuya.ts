import { CURRENCIES } from "~/config/consts"
import { BaseScraper } from "~/helpers/scrapers/product/base.server"
import { cleanText } from "~/utils/scraper"

export default class Cabuya extends BaseScraper {
  static domain = "cabuya.com.do"

  get title() {
    return this.page
      .$eval("h1", (element) => element.textContent)
      .then(cleanText)
      .catch((err) => this.logError("title: " + err.message))
  }

  get store() {
    return "Cabuya"
  }

  get currency() {
    return CURRENCIES.USD
  }
}
