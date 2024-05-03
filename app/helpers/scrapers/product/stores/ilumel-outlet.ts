import { BaseScraper } from "~/helpers/scrapers/product/base.server"

export default class IlumelOutlet extends BaseScraper {
  static domain = "ilumeloutlet.com"

  public get store(): string | null {
    return "Ilumel Outlet"
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("meta[property='og:title']", (element) => element.getAttribute("content"))
      .catch((err) => this.logError("title: " + err.message))
  }
}
