import { BaseScraper } from "~/helpers/scrapers/product/base.server"

export default class PlazaLamaScraper extends BaseScraper {
  static domain = "plazalama.com.do"

  public get store(): string | null {
    return "Plaza Lama"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("meta[property='og:title']", (element) =>
        element.getAttribute("content")
      )
      .catch((err) => this.logError("title: " + err.message))
  }

  public get description(): Promise<string | null> {
    return this.page
      .$eval("meta[property='og:description']", (element) =>
        element.getAttribute("content")
      )
      .catch((err) => this.logError("description: " + err.message))
  }
}
