import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { z } from "zod"
import { zx } from "zodix"

import { ONE_DAY, REDIS_KEYS } from "~/config/consts"
import auth from "~/helpers/auth.server"
import { productScraper } from "~/helpers/scraper.server"
import { generateKey } from "~/utils/redis"
import { unauthorized } from "~/utils/remix"
import { ScrapedProduct } from "~/utils/scraper"

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { logger, cache } = context
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized()
  }

  const { url } = zx.parseQuery(request, { url: z.string() })

  const key = generateKey(REDIS_KEYS.ProductScraper, url)

  const cachedPayload = await cache.get(key)

  if (cachedPayload) {
    const result = ScrapedProduct.parse(JSON.parse(cachedPayload))

    return json({ ...result, cached: true })
  }

  // TODO(adelrodriguez): We should create the browser instance here and pass it
  // to the scraped function. This way we can reuse the browser instance for all
  // the scrapers.
  const payload = await productScraper(url)

  if (payload.errors.length > 0) {
    // TODO(adelrodriguez): Report errors to Sentry
    logger.warn(`${url} scrapped with errors: ${payload.errors.join(", ")}`)
  } else {
    logger.info(`${url} scrapped successfully`)
  }

  if (payload.errors.length === 0) {
    await cache.set(key, JSON.stringify(payload), "EX", ONE_DAY.inSeconds)
  }

  return json(payload)
}
