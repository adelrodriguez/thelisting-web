import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import * as Sentry from "@sentry/node"

import prisma from "~/helpers/prisma.server"
import { goHome } from "~/utils/remix"
import { getShopifyId } from "~/utils/shopify"
import { getOrderTags } from "~/utils/shopify.server"

export async function loader({ request }: LoaderArgs) {
  const requestUrl = new URL(request.url)
  const orderId = requestUrl.searchParams.get("order_id")

  if (!orderId) throw goHome()

  try {
    // The first tag always contains the listing ID
    const [listingId] = await getOrderTags(getShopifyId(orderId, "Order"))

    if (!listingId) throw goHome()

    const listing = await prisma.listing.findFirst({
      select: { path: true },
      where: { id: listingId },
    })

    if (!listing) throw goHome()

    return redirect(`/${listing.path}/thank-you?order_id=${orderId}`)
  } catch (error) {
    Sentry.captureException(error)

    return goHome()
  }
}
