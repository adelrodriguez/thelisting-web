import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

import { productScraper } from "~/helpers/scraper.server"
import type { LoaderResult } from "~/types/remix"
import type { ScraperProductResponse } from "~/types/scraper"

export async function loader({
  request,
}: LoaderArgs): Promise<LoaderResult<ScraperProductResponse>> {
  // TODO(adelrodriguez): Add authentication

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
