import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

import { productScraper } from "~/helpers/scraper.server"
import type { ScraperProductResponse } from "~/helpers/scraper.server"
import type { LoaderResult } from "~/types/remix"

export const loader = async ({
  request,
}: LoaderArgs): Promise<LoaderResult<ScraperProductResponse>> => {
  const requestUrl = new URL(request.url)
  const id = requestUrl.searchParams.get("id")
  const url = requestUrl.searchParams.get("url")

  if (!id || !url) {
    throw new Response("Bad Request", {
      status: 400,
    })
  }

  const payload = await productScraper({ id, url })

  return json(payload)
}
