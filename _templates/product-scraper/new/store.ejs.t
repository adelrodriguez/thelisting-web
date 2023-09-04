---
to: app/helpers/scrapers/product/stores/<%= name %>.ts
---

import { BaseScraper } from "~/helpers/scrapers/product/base.server"

export default class <%= h.changeCase.pascal(name) %>Scraper extends BaseScraper {
  static domain = "<%= url %>"

  public get store(): string | null {
    return "<%= store %>"
  }
}
