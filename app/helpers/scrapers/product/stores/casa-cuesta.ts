import { BaseScraper } from "./base"

export default class CasaCuestaScraper extends BaseScraper {
  static domain = "casacuesta.com"

  protected async waitFor() {
    await this.page.waitForSelector("img.fotorama__img")
  }

  public get store(): string {
    return "Casa Cuesta"
  }

  public get image(): Promise<string | null> {
    return this.page
      .$eval("img.fotorama__img", (element) => element.getAttribute("src"))
      .catch((err) => this.logError("image: " + err.message))
  }
}
