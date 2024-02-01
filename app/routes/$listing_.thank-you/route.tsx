import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { zx } from "zodix"

import { OrderItem } from "~/components/registry"
import posthog, { getDistinctId } from "~/services/posthog.server"
import Sentry from "~/services/sentry"
import { notFound } from "~/utils/http"
import { formatPrice } from "~/utils/money"
import { getShopifyId } from "~/utils/shopify"
import { getOrder } from "~/utils/shopify.server"

export const handle = {
  id: "listing-thank-you",
}

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const db = context.db
  const logger = context.logger

  const result = zx.parseQuerySafe(request, { order_id: z.string() })

  if (!result.success) {
    Sentry.captureMessage("No order id found in request")

    throw notFound({
      message: "Sorry, we couldn’t find the page you’re looking for.",
      title: "Not Found",
    })
  }

  const orderId = result.data.order_id

  try {
    const { listing: path } = zx.parseParams(params, { listing: z.string() })

    const order = await getOrder(getShopifyId(orderId, "Order"))

    const listing = await db.listing.findFirstOrThrow({
      where: { path, status: "Published" },
    })

    const distinctId = getDistinctId(request.headers)

    // Identify the user in PostHog so we can track their activity
    posthog.identify({
      distinctId,
      properties: {
        email: order.customer?.email,
        name: order.customer?.displayName,
      },
    })

    // Track the order completed event
    posthog.capture({
      distinctId,
      event: "order_completed",
      properties: {
        listingId: listing.id,
        orderId,
        total: order.totalPriceSet.presentmentMoney.amount,
      },
    })

    return json({ listing, order })
  } catch (error) {
    Sentry.captureException(error)

    logger.error((error as Error).message, { orderId })

    throw notFound({
      message: "Sorry, we couldn’t find the page you’re looking for.",
      title: "Not Found",
    })
  }
}

export default function ListingThankYouPage() {
  const { t } = useTranslation(["thank_you", "common"])
  const { listing, order } = useLoaderData<typeof loader>()

  const total = order.totalPriceSet.presentmentMoney

  return (
    <main className="relative lg:min-h-full">
      <div className="h-80 overflow-hidden lg:fixed lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
        <img
          alt=""
          className="h-full w-full object-cover object-center"
          src={
            listing.thankYouImage
              ? listing.thankYouImage
              : "https://imagedelivery.net/wHwwAqNxbuESOwdHNE6NsQ/2975847d-0983-43ab-7e0e-fb492e932700/display" // TODO(adelrodriguez): Replace with image on public directory
          }
        />
      </div>

      <div>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
          <div className="lg:col-start-2">
            <h1 className="font-body text-sm font-medium text-gray-600">
              {t("thank_you:gift_sent")}
            </h1>
            <p className="mt-2 font-headline text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {t("thank_you:thank_you", { name: order.customer?.firstName })}
            </p>
            <p className="mt-4 font-body text-base text-gray-500">
              {t("thank_you:confirmation")}
            </p>

            <ul className="mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-gray-500">
              {order.lineItems.nodes.map(
                (lineItem) =>
                  lineItem.product?.id && (
                    <li className="py-6" key={lineItem.product.id}>
                      <OrderItem
                        commerceId={lineItem.product.id}
                        quantity={lineItem.quantity}
                      />
                    </li>
                  ),
              )}
            </ul>

            <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
              <dt className="text-base">{t("common:total")}</dt>
              <dd className="text-base">
                {formatPrice(total.amount, total.currencyCode)}
              </dd>
            </div>

            <div className="mt-16 text-sm text-gray-600">
              <dt className="font-medium text-gray-900">
                {t("thank_you:billing_address")}
              </dt>
              <dd className="mt-2">
                <address className="not-italic">
                  <span className="block">{order.customer?.displayName}</span>
                  <span className="block">
                    {order.billingAddress?.address1}
                  </span>
                  <span className="block">
                    {order.billingAddress?.city},{" "}
                    {order.billingAddress?.country} {order.billingAddress?.zip}
                  </span>
                </address>
              </dd>
            </div>

            <div className="mt-16 border-t border-gray-200 py-6 text-right">
              <Link
                className="text-sm font-medium text-gray-600 hover:text-gray-500"
                to={"/" + listing.path}
              >
                {t("thank_you:go_back")}
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
