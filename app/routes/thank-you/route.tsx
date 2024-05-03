import type { LoaderFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"

import { CUSTOM_ATTRIBUTES } from "~/config/consts"
import Sentry from "~/services/sentry"
import { getShopifyId } from "~/utils/shopify"
import { getOrderCustomAttributes } from "~/utils/shopify.server"

export async function loader({ context, request }: LoaderFunctionArgs) {
  const db = context.db
  const logger = context.logger
  const requestUrl = new URL(request.url)
  const orderId = requestUrl.searchParams.get("order_id")

  try {
    if (!orderId) throw new Error("No order id found in request")

    const customAttributes = await getOrderCustomAttributes(getShopifyId(orderId, "Order"))
    const listingId = customAttributes[CUSTOM_ATTRIBUTES.ListingId]

    if (!listingId) {
      throw new Error("No listing id found in order custom attributes")
    }

    const listing = await db.listing.findFirstOrThrow({
      select: { path: true },
      where: { id: listingId },
    })

    return redirect(`/${listing.path}/thank-you?order_id=${orderId}`)
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        orderId,
      },
    })

    logger.error((error as Error).message, {
      orderId,
    })

    return redirect("/")
  }
}
