import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import * as Sentry from "@sentry/node"

import prisma from "~/helpers/prisma.server"
import { goHome } from "~/utils/remix"
import { getOrder } from "~/utils/shopify.server"

export async function loader({ request }: LoaderArgs) {
  const requestUrl = new URL(request.url)
  const orderId = requestUrl.searchParams.get("order_id")

  if (!orderId) {
    return goHome()
  }

  try {
    const order = await getOrder(`gid://shopify/Order/${orderId}`)
    // The first tag always contains the listing ID
    const listingId = order.tags[0]

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return goHome()
    }

    return redirect(`/${listing.path}/thankyou`)
  } catch (error) {
    Sentry.captureException(error)

    return goHome()
  }
}
