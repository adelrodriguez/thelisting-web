import { BaseScraper } from "./base"

export default class BebeMundoScraper extends BaseScraper {
  waitForSelector = "img.fotorama__img"

  static domain = "bebemundo.com.do"

  public get store(): string | null {
    return "Bebe Mundo"
  }

  public get image(): Promise<string | null> {
    return this.page
      .$eval("img.fotorama__img", (element) => element.getAttribute("src"))
      .catch((err) => this.logError("image: " + err.message))
  }
}
