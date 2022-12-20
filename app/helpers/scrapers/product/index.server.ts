import type { ScrapedProductResult } from "~/types/scraper"
import { UnknownError } from "~/utils/errors"
import { logger } from "~/utils/log"

import createScraper from "./scraper.server"

export default async function scraper(
  requestUrl: string
): Promise<ScrapedProductResult> {
  logger.info(`Scrapping product ${requestUrl}`, {
    url: requestUrl,
  })

  const url = new URL(requestUrl)

  const scraper = await createScraper(url)

  try {
    // Launch the browser and go to a new page
    await scraper.init()

    // Obtain scraped properties
    const title = await scraper.title
    const description = await scraper.description
    const image = await scraper.image
    const amount = await scraper.amount
    const currency = await scraper.currency
    const store = scraper.store

    // Close the browser window
    await scraper.stop()

    const payload: ScrapedProductResult = {
      duration: scraper.duration,
      fields: {
        amount,
        currency,
        description,
        image,
        store,
        title,
      },
      time: new Date().getTime(),
      url: requestUrl,
    }

    return payload
  } catch (error) {
    // TODO(adelrodriguez): Handle timeout errors
    throw new UnknownError((error as Error).message)
  }
}
