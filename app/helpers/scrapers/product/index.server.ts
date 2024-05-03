import { parse } from "tldts"

import type { ArrayElement } from "~/utils/type"

import type { ScraperConfig, ScraperInterface } from "./base.server"
import createScraperFactory, { BaseScraper } from "./base.server"
import * as storeScrapers from "./stores"

export default async function createScraper({
  browser,
  logger,
  url,
}: ScraperConfig): Promise<ScraperInterface> {
  const { domain } = parse(url.hostname)

  const scraperFactory = createScraperFactory({ browser, logger, url })
  const availableScrapers = Object.values(storeScrapers)

  const scrapers = availableScrapers.reduce(
    (acc: Record<string, ArrayElement<typeof availableScrapers>>, scraper) => {
      acc[scraper.domain] = scraper
      return acc
    },
    {},
  )

  const scraper = Object.keys(scrapers).find((storeDomain) => storeDomain === domain)

  const storeScraper = scraper
    ? // If store is not found, use default scraper
      scrapers[scraper] || BaseScraper
    : BaseScraper

  return scraperFactory(storeScraper)
}
