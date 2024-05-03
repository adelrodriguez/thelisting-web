import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/helpers/auth.server"
import Sentry from "~/services/sentry"
import { UnknownError } from "~/utils/error"
import { unauthorized } from "~/utils/http"

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { env, logger } = context
  const { SCRAPER_TOKEN, SCRAPER_URL } = env
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized()
  }

  const { url } = zx.parseQuery(request, { url: z.string() })

  try {
    const requestUrl = new URL(SCRAPER_URL)
    requestUrl.searchParams.set("url", url)

    const res = await fetch(requestUrl, {
      headers: { Authorization: `Bearer ${SCRAPER_TOKEN}` },
    })

    const data = await res.json()

    return json(data)
  } catch (error) {
    Sentry.captureException(error)
    logger.error(`Error scrapping product ${url}`, {
      error: (error as Error).message,
      url,
    })

    throw new UnknownError((error as Error).message)
  }
}
