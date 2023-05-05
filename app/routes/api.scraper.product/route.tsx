import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { ReasonPhrases, StatusCodes } from "http-status-codes"

import { ONE_DAY, REDIS_KEYS } from "~/config/consts"
import auth from "~/helpers/auth.server"
import { productScraper } from "~/helpers/scraper.server"
import { generateKey } from "~/utils/redis"
import { parseScrapedProductResult } from "~/utils/scraper"

export async function loader({ request, context }: LoaderArgs) {
  const user = await auth.isAuthenticated(request)
  const { logger, cache, db } = context

  if (!user) {
    throw json("You must be logged in to access this resource", {
      status: StatusCodes.UNAUTHORIZED,
      statusText: ReasonPhrases.UNAUTHORIZED,
    })
  }

  const requestUrl = new URL(request.url)
  const url = requestUrl.searchParams.get("url")

  if (!url) {
    throw json("Missing url parameter", {
      status: StatusCodes.BAD_REQUEST,
      statusText: ReasonPhrases.BAD_REQUEST,
    })
  }

  const key = generateKey(REDIS_KEYS.ProductScraper, url)

  const cachedPayload = await cache.get(key)

  if (cachedPayload) {
    const result = parseScrapedProductResult(JSON.parse(cachedPayload))

    return json({ cached: true, ...result })
  }

  const payload = await productScraper(url)

  if (payload.errors.length > 0) {
    logger.warn(`${url} scrapped with errors: ${payload.errors.join(", ")}`)
  } else {
    logger.info(`${url} scrapped successfully`)
  }

  const scrapedProduct = await db.scrapedProduct.create({
    data: {
      duration: payload.duration,
      errors: payload.errors,
      time: payload.time,
      url,
      ...payload.fields,
    },
  })

  if (payload.errors.length === 0) {
    await cache.set(
      key,
      JSON.stringify({ id: scrapedProduct.id, payload }),
      "EX",
      ONE_DAY
    )
  }

  return json({ id: scrapedProduct.id, payload })
}
