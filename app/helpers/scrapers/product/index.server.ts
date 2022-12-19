import { UnknownError } from "~/utils/errors"
import { logger } from "~/utils/log"

import createScraper from "./scraper.server"

export type ScrapedProduct = {
  title: string | null
  store: string | null
  description: string | null
  image: string | null
  amount: number | null
  currency: string | null
}

export type ScraperProductRequest = {
  id: string
  url: string
}

export type ScraperProductResponse = {
  id: string
  url: string
  /** The start time the function was executed */
  time: number
  /** The duration for the function execution (in milliseconds)  */
  duration: number
  product: ScrapedProduct
}

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
      id: request.id,
      product: {
        amount,
        currency,
        description,
        image,
        store,
        title,
      },
      time: new Date().getTime(),
      url: request.url,
    }

    const hasErrors = Object.values(payload.product).some((el) => el === null)

    if (hasErrors) {
      logger.warn(`Product ${request.id} scrapped with errors`, {
        payload,
      })
    } else {
      logger.info(`Product ${request.id} scrapped successfully`, {
        payload,
      })
    }

    return payload
  } catch (error) {
    // TODO(adelrodriguez): Handle timeout errors
    throw new UnknownError((error as Error).message)
  }
}
