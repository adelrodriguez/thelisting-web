import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

import auth from "~/helpers/auth.server"
import db from "~/helpers/db.server"
import { productScraper } from "~/helpers/scraper.server"
import type { LoaderResult } from "~/types/remix"
import type { ScrapedProductResult } from "~/types/scraper"
import { ReasonPhrases, StatusCodes } from "~/utils/http"
import { logger } from "~/utils/log"

export async function loader({
  request,
}: LoaderArgs): Promise<LoaderResult<ScrapedProductResult>> {
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw new Response(ReasonPhrases.UNAUTHORIZED, {
      status: StatusCodes.UNAUTHORIZED,
      statusText: "You must be logged in to access this resource",
    })
  }

  const requestUrl = new URL(request.url)
  const url = requestUrl.searchParams.get("url")

  if (!url) {
    throw new Response(ReasonPhrases.BAD_REQUEST, {
      status: StatusCodes.BAD_REQUEST,
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

  await db.scrapedProduct.create({
    data: {
      duration: payload.duration,
      time: payload.time,
      url,
      ...payload.fields,
    },
  })

  return json(payload)
}
