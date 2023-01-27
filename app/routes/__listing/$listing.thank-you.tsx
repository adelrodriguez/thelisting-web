import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { useEffect } from "react"

import { FormattedNumber } from "~/components/common"
import OrderItem from "~/components/registry/OrderItem"
import prisma from "~/helpers/prisma.server"
import { clearCart } from "~/utils/cart"
import { ReasonPhrases, StatusCodes } from "~/utils/http.server"
import { getPriceSymbol } from "~/utils/money"
import { goHome, json, useLoaderData } from "~/utils/remix"
import { getShopifyId } from "~/utils/shopify"
import { getOrder } from "~/utils/shopify.server"

export async function loader({ params, request }: LoaderArgs) {
  const requestUrl = new URL(request.url)
  const path = params.listing
  const orderId = requestUrl.searchParams.get("order_id")

  if (!path) throw goHome()

  if (!orderId) throw redirect(`/${path}`)

  const order = await getOrder(getShopifyId(orderId, "Order"))

  const listing = await prisma.listing.findFirst({
    where: { path, status: "Published" },
  })

  if (!listing) {
    throw json("Sorry, we couldn’t find the Listing you’re looking for.", {
      status: StatusCodes.NOT_FOUND,
      statusText: ReasonPhrases.NOT_FOUND,
    })
  }

  return json({ listing, order })
}

export default function ListingThankYouPage() {
  const { listing, order } = useLoaderData<typeof loader>()

  useEffect(() => {
    // Clear the cart
    clearCart(listing.id)
  }, [listing.id])

  const total = order.totalPriceSet.presentmentMoney

  return (
    <main className="relative lg:min-h-full">
      <div className="h-80 overflow-hidden lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
        <img
          src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
          alt="TODO"
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div>
        <div className="mx-auto max-w-2xl py-16 px-4 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
          <div className="lg:col-start-2">
            <h1 className="text-sm font-medium text-gray-600">Gift sent!</h1>
            <p className="mt-2 text-4xl font-bold font-header tracking-tight text-gray-900 sm:text-5xl">
              Thanks for your gift, {order.customer?.firstName}!
            </p>
            <p className="mt-2 text-base text-gray-500">
              TODO: A thank you message for the gift sender is shown here.
            </p>

            <ul className="mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-gray-500">
              {order.lineItems?.nodes.map((lineItem) => (
                <li key={lineItem.product?.id} className="flex space-x-6 py-6">
                  <OrderItem
                    commerceId={lineItem.product?.id!}
                    quantity={lineItem.quantity}
                  />
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
              <dt className="text-base">Total</dt>
              <dd className="text-base">
                <FormattedNumber
                  prefix={getPriceSymbol(total.currencyCode)}
                  thousands
                  decimals={2}
                >
                  {total.amount}
                </FormattedNumber>
              </dd>
            </div>

            <div className="mt-16 text-sm text-gray-600">
              <dt className="font-medium text-gray-900">Billing Address</dt>
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
                Go back to the page
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
