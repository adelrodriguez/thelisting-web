import { BaseScraper } from "./base"

export default class HifiScraper extends BaseScraper {
  static domain = "hifi.com.do"

  public get store(): string | null {
    return "Hifi"
  }
}
