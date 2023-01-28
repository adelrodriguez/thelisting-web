import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import * as Sentry from "@sentry/node"

import { CUSTOM_ATTRIBUTES } from "~/config/consts"
import prisma from "~/helpers/prisma.server"
import { goHome } from "~/utils/remix"
import { getShopifyId } from "~/utils/shopify"
import { getOrderCustomAttributes } from "~/utils/shopify.server"

export async function loader({ request }: LoaderArgs) {
  const requestUrl = new URL(request.url)
  const orderId = requestUrl.searchParams.get("order_id")

  if (!orderId) throw goHome()

  try {
    const customAttributes = await getOrderCustomAttributes(
      getShopifyId(orderId, "Order")
    )
    const listingId = customAttributes[CUSTOM_ATTRIBUTES.ListingId]

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
