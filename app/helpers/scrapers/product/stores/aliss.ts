import { BaseScraper } from "~/helpers/scrapers/product/base.server"

export default class AlissScraper extends BaseScraper {
  static domain = "aliss.do"

  public get store(): string | null {
    return "Aliss"
  }
}
