import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { z } from "zod"
import { zx } from "zodix"

import { ONE_DAY, REDIS_KEYS } from "~/config/consts"
import auth from "~/helpers/auth.server"
import { createScraper } from "~/helpers/scraper.server"
import { getBrowserInstance } from "~/services/browserless.server"
import Sentry from "~/services/sentry"
import { UnknownError } from "~/utils/error"
import { unauthorized } from "~/utils/http"
import { generateKey } from "~/utils/redis"
import { ScrapedProduct } from "~/utils/scraper"

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { cache, env, logger } = context
  const { BROWSERLESS_TOKEN, BROWSERLESS_URL } = env
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized()
  }

  const { url } = zx.parseQuery(request, { url: z.string() })

  const key = generateKey(REDIS_KEYS.ProductScraper, url)

  const cachedPayload = await cache.get(key)

  if (cachedPayload) {
    logger.info(`Using cached product`, { url })
    const result = ScrapedProduct.parse(JSON.parse(cachedPayload))

    return json({ ...result, cached: true })
  }

  logger.info(`Scrapping product...`, { url })

  const browser = await getBrowserInstance(BROWSERLESS_URL, BROWSERLESS_TOKEN)
  const scraper = await createScraper({ browser, logger, url: new URL(url) })

  try {
    const payload = await scraper.exec()

    if (payload.errors.length > 0) {
      // TODO(adelrodriguez): Report errors to Sentry
      logger.warn(
        `${url} scrapped with errors: ${payload.errors.join(", ")}`,
        payload,
      )

      Sentry.captureMessage("Product scrapped with errors", {
        extra: payload,
      })
    } else {
      logger.info(`${url} scrapped successfully`, payload)

      await cache.set(key, JSON.stringify(payload), "EX", ONE_DAY.inSeconds)
    }

    return json(payload)
  } catch (error) {
    Sentry.captureException(error)
    logger.error(`Error scrapping product ${url}`, {
      error: (error as Error).message,
      url,
    })

    // TODO(adelrodriguez): Handle timeout errors
    throw new UnknownError((error as Error).message)
  }
}
