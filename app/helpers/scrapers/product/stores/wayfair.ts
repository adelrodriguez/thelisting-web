import { cleanText } from "~/utils/scraper"

import { BaseScraper } from "../base.server"

export default class WayfairScraper extends BaseScraper {
  static domain = "wayfair.com"

  public get store() {
    return "Wayfair"
  }

  public get title() {
    return this.page
      .$eval("meta[property='og:title']", (element) =>
        element.getAttribute("content")
      )
      .then(cleanText)
  }
}
