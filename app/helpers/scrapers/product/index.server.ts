import type {
  ScraperProductRequest,
  ScraperProductResponse,
} from "~/types/scraper"
import { UnknownError } from "~/utils/errors"
import { logger } from "~/utils/log"

import createScraper from "./scraper.server"

export default async function scraper(
  request: ScraperProductRequest
): Promise<ScraperProductResponse> {
  logger.info(`Scrapping product ${request.id}`, {
    url: request.url,
  })

  const url = new URL(request.url)

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

    const payload = {
      duration: scraper.duration,
      fields: {
        amount,
        currency,
        description,
        image,
        store,
        title,
      },
      id: request.id,
      time: new Date().getTime(),
      url: request.url,
    }

    // Check if there are errors in the payload
    const errors = Object.entries(payload.fields).reduce(
      (acc: Record<string, unknown>, [key, value]) => {
        if (value === null) {
          acc[key] = value
        }
        return acc
      },
      {}
    )

    if (Object.keys(errors).length > 0) {
      logger.warn(`Product ${request.id} scrapped with errors`)
      logger.table(errors)
    } else {
      logger.success(`Product ${request.id} scrapped successfully`)
    }

    return payload
  } catch (error) {
    // TODO(adelrodriguez): Handle timeout errors
    throw new UnknownError((error as Error).message)
  }
}
