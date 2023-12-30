import logger from "~/helpers/logger.server"
import Sentry from "~/services/sentry"
import { UnknownError } from "~/utils/error"
import type { ScrapedProduct } from "~/utils/scraper"

import createScraper from "./scraper.server"

export default async function scraper(
  requestUrl: string,
): Promise<ScrapedProduct> {
  logger.info(`Scrapping product ${requestUrl}`, {
    url: requestUrl,
  })

  const url = new URL(requestUrl)

  const scraper = await createScraper(url)

  try {
    // Launch the browser and go to a new page
    await scraper.init()

    // Obtain scraped properties
    const [title, description, image, amount, currency, store] =
      await Promise.all([
        scraper.title,
        scraper.description,
        scraper.image,
        scraper.amount,
        scraper.currency,
        scraper.store,
      ])

    // Close the browser window
    await scraper.stop()

    const payload: ScrapedProduct = {
      duration: scraper.duration,
      errors: [],
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

    Object.entries(payload.fields).forEach(([key, value]) => {
      if (value === null) payload.errors.push(key)
    })

    return payload
  } catch (error) {
    Sentry.captureException(error)
    logger.error(`Error scrapping product ${requestUrl}`, {
      error: (error as Error).message,
      url: requestUrl,
    })

    // TODO(adelrodriguez): Handle timeout errors
    throw new UnknownError((error as Error).message)
  }
}
