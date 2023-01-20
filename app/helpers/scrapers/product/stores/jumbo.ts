import { BaseScraper } from "./base"

export default class JumboScraper extends BaseScraper {
  static domain = "jumbo.com.do"

  public get store() {
    return "Jumbo"
  }
}
