import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"
import { productScraper } from "~/helpers/scraper.server"
import type { LoaderResult } from "~/types/remix"
import type { ScrapedProductResult } from "~/types/scraper"
import { ReasonPhrases, StatusCodes } from "~/utils/http.server"
import { logger } from "~/utils/log"

export async function loader({
  request,
}: LoaderArgs): Promise<LoaderResult<ScrapedProductResult>> {
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw new Response("You must be logged in to access this resource", {
      status: StatusCodes.UNAUTHORIZED,
      statusText: ReasonPhrases.UNAUTHORIZED,
    })
  }

  const requestUrl = new URL(request.url)
  const url = requestUrl.searchParams.get("url")

  if (!url) {
    throw new Response("Missing url parameter", {
      status: StatusCodes.BAD_REQUEST,
      statusText: ReasonPhrases.BAD_REQUEST,
    })
  }

  const payload = await productScraper(url)

  // Check if there are errors in the payload
  if (payload.errors.length > 0) {
    logger.warn(`${url} scrapped with errors: ${payload.errors.join(", ")}`)
  } else {
    logger.success(`${url} scrapped successfully`)
  }

  await db.scrapedProduct.create({
    data: {
      duration: payload.duration,
      errors: payload.errors,
      time: payload.time,
      url,
      ...payload.fields,
    },
  })

  return json(payload)
}
