import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import * as Sentry from "@sentry/node"

import { CUSTOM_ATTRIBUTES } from "~/config/consts"
import { getShopifyId } from "~/utils/shopify"
import { getOrderCustomAttributes } from "~/utils/shopify.server"

export async function loader({ request, context }: LoaderArgs) {
  const db = context.db
  const requestUrl = new URL(request.url)
  const orderId = requestUrl.searchParams.get("order_id")

  if (!orderId) throw redirect("/")

  try {
    const customAttributes = await getOrderCustomAttributes(
      getShopifyId(orderId, "Order")
    )
    const listingId = customAttributes[CUSTOM_ATTRIBUTES.ListingId]

    if (!listingId) throw redirect("/")

    const listing = await db.listing.findFirst({
      select: { path: true },
      where: { id: listingId },
    })

    if (!listing) throw redirect("/")

    return redirect(`/${listing.path}/thank-you?order_id=${orderId}`)
  } catch (error) {
    Sentry.captureException(error)

    return redirect("/")
  }
}
