import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

import { ONE_DAY, REDIS_KEYS } from "~/config/consts"
import auth from "~/helpers/auth.server"
import prisma from "~/helpers/prisma.server"
import redis from "~/helpers/redis.server"
import { productScraper } from "~/helpers/scraper.server"
import { ReasonPhrases, StatusCodes } from "~/utils/http.server"
import { logger } from "~/utils/log"
import { generateKey } from "~/utils/redis"
import type { ScrapedProductResult } from "~/utils/scraper"

export async function loader({ request }: LoaderArgs) {
  const user = await auth.isAuthenticated(request)

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

  const cachedPayload = await redis.get(key)

  if (cachedPayload) {
    const payload = JSON.parse(cachedPayload) as ScrapedProductResult

    return json({ ...payload, cached: true })
  }

  const payload = await productScraper(url)

  if (payload.errors.length > 0) {
    logger.warn(`${url} scrapped with errors: ${payload.errors.join(", ")}`)
  } else {
    logger.success(`${url} scrapped successfully`)
  }

  await prisma.scrapedProduct.create({
    data: {
      duration: payload.duration,
      errors: payload.errors,
      time: payload.time,
      url,
      ...payload.fields,
    },
  })

  if (payload.errors.length === 0) {
    await redis.set(key, JSON.stringify(payload), "EX", ONE_DAY)
  }

  return json(payload)
}
