import { CURRENCIES } from "~/config/consts"
import { cleanAmount, cleanText } from "~/utils/scraper"

import { BaseScraper } from "./base"

export default class ElectrodomesticosComDo extends BaseScraper {
  static domain = "electrodomesticos.com.do"

  public get store(): string | null {
    return "Electrodomesticos.com.do"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("h1", (element) => element.textContent)
      .then(cleanText)
      .catch((err) => this.logError(err.message))
  }

  public get description(): Promise<string | null> {
    return this.page
      .$eval(".std", (element) => element.textContent)
      .then(cleanText)
      .catch((err) => this.logError(err.message))
  }

  public get image(): Promise<string | null> {
    return this.page
      .$eval(".zoomLens > img", (element) => element.getAttribute("src"))
      .catch((err) => this.logError(err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval(".price", (element) => element.textContent)
      .then(cleanAmount)
      .catch((err) => this.logError(err.message))
  }

  public get currency() {
    return CURRENCIES.DOP
  }
}
