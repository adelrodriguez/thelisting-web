import { BaseScraper } from "~/helpers/scrapers/product/base.server"

export default class JumboScraper extends BaseScraper {
  static domain = "jumbo.com.do"

  public get store() {
    return "Jumbo"
  }
}
