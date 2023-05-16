import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import invariant from "tiny-invariant"

import { CUSTOM_ATTRIBUTES } from "~/config/consts"
import { getShopifyId } from "~/utils/shopify"
import { getOrderCustomAttributes } from "~/utils/shopify.server"

export async function loader({ request, context }: LoaderArgs) {
  const db = context.db
  const logger = context.logger
  const requestUrl = new URL(request.url)
  const orderId = requestUrl.searchParams.get("order_id")

  try {
    invariant(orderId, "No order id found in request")

    const customAttributes = await getOrderCustomAttributes(
      getShopifyId(orderId, "Order")
    )
    const listingId = customAttributes[CUSTOM_ATTRIBUTES.ListingId]

    invariant(listingId, "No listing id found in order custom attributes")

    const listing = await db.listing.findFirstOrThrow({
      select: { path: true },
      where: { id: listingId },
    })

    return redirect(`/${listing.path}/thank-you?order_id=${orderId}`)
  } catch (error) {
    logger.error((error as Error).message, {
      orderId,
    })

    return redirect("/")
  }
}
