import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { z } from "zod"
import { zx } from "zodix"

import { ONE_DAY, REDIS_KEYS } from "~/config/consts"
import auth from "~/helpers/auth.server"
import { productScraper } from "~/helpers/scraper.server"
import { generateKey } from "~/utils/redis"
import { unauthorized } from "~/utils/remix"
import { parseScrapedProductResult } from "~/utils/scraper"

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { logger, cache, db } = context
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized()
  }

  const { url } = zx.parseQuery(request, { url: z.string() })

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
      ONE_DAY.inSeconds
    )
  }

  return json({ id: scrapedProduct.id, payload })
}
