import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { useTranslation } from "react-i18next"
import invariant from "tiny-invariant"
import { z } from "zod"
import { zx } from "zodix"

import { Image } from "~/components/common"
import { OrderItem } from "~/components/registry"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import useTrackPageview from "~/utils/hooks/use-track-pageview"
import { formatPrice } from "~/utils/money"
import { getShopifyId } from "~/utils/shopify"
import { getOrder } from "~/utils/shopify.server"

export const handle = {
  i18n: ["registry", "common"],
}

export async function loader({ params, request, context }: LoaderArgs) {
  const db = context.db
  const logger = context.logger
  const requestUrl = new URL(request.url)
  const orderId = requestUrl.searchParams.get("order_id")

  try {
    const { listing: path } = zx.parseParams(params, { listing: z.string() })

    invariant(orderId, "No order id found in request")

    const order = await getOrder(getShopifyId(orderId, "Order"))

    const listing = await db.listing.findFirst({
      where: { path, status: "Published" },
    })

    if (!listing) {
      throw json(
        {
          message: "Sorry, we couldn’t find the page you’re looking for.",
          title: "Not Found",
        },
        {
          status: StatusCodes.NOT_FOUND,
          statusText: ReasonPhrases.NOT_FOUND,
        }
      )
    }

    return json({ listing, order })
  } catch (error) {
    logger.error((error as Error).message, {
      orderId,
    })

    return redirect("/")
  }
}

export default function ListingThankYouPage() {
  const { t } = useTranslation(handle.i18n)
  const { listing, order } = useLoaderData<typeof loader>()

  const total = order.totalPriceSet.presentmentMoney

  useTrackPageview({ orderId: order.id })

  return (
    <main className="relative lg:min-h-full">
      <div className="h-80 overflow-hidden lg:fixed lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
        <Image
          src={
            listing.thankYouImage
              ? generateCloudflareImageUrl(listing.thankYouImage, "display")
              : "https://imagedelivery.net/wHwwAqNxbuESOwdHNE6NsQ/2975847d-0983-43ab-7e0e-fb492e932700/display"
          }
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div>
        <div className="mx-auto max-w-2xl py-16 px-4 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
          <div className="lg:col-start-2">
            <h1 className="font-body text-sm font-medium text-gray-600">
              {t("giftSent")}
            </h1>
            <p className="mt-2 font-headline text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {t("thankYou", { name: order.customer?.firstName })}
            </p>
            <p className="mt-4 font-body text-base text-gray-500">
              {t("orderConfirmation")}
            </p>

            <ul className="mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-gray-500">
              {order.lineItems?.nodes.map((lineItem) => (
                <li key={lineItem.product?.id} className="py-6">
                  <OrderItem
                    commerceId={lineItem.product?.id!}
                    quantity={lineItem.quantity}
                  />
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
              <dt className="text-base">{t("common:total")}</dt>
              <dd className="text-base">
                {formatPrice(total.amount, total.currencyCode)}
              </dd>
            </div>

            <div className="mt-16 text-sm text-gray-600">
              <dt className="font-medium text-gray-900">
                {t("common:billingAddress")}
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
                to={"/" + listing.path}
                className="text-sm font-medium text-gray-600 hover:text-gray-500"
              >
                {t("goBack")}
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
