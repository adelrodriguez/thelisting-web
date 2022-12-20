import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

import { productScraper } from "~/helpers/scraper.server"
import type { LoaderResult } from "~/types/remix"
import type { ScrapedProductResult } from "~/types/scraper"
import { logger } from "~/utils/log"

export async function loader({
  request,
}: LoaderArgs): Promise<LoaderResult<ScrapedProductResult>> {
  // TODO(adelrodriguez): Add authentication

  const requestUrl = new URL(request.url)
  const url = requestUrl.searchParams.get("url")

  if (!url) {
    throw new Response("Bad Request", {
      status: 400,
    })
  }

  const payload = await productScraper(url)

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
    logger.warn(`${url} scrapped with errors`)
    logger.table(errors)
  } else {
    logger.success(`${url} scrapped successfully`)
  }

  return json(payload)
}
