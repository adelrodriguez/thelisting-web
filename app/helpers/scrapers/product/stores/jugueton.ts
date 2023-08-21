import { BaseScraper } from "~/helpers/scrapers/product/base.server"

export default class JuguetonScraper extends BaseScraper {
  static domain = "jugueton.com.do"

  protected async waitFor() {
    await this.page.waitForSelector("img.fotorama__img")
  }

  public get store(): string {
    return "Juguetón"
  }

  public get image(): Promise<string | null> {
    return this.page
      .$eval("img.fotorama__img", (element) => element.getAttribute("src"))
      .catch((err) => this.logError("image: " + err.message))
  }
}
