import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import currency from "currency.js"
import { format } from "date-fns"
import { z } from "zod"
import { zx } from "zodix"

import { CREDIT_CARD_FEE, SHIPPING_FEE, SHOPIFY_FEE } from "~/config/consts"
import { getPriceSymbol } from "~/utils/money"
import { notFound } from "~/utils/remix"

export const handle = {
  // @ts-expect-error fix the typing for this
  crumb: ({ params }) => ({
    href: `/dashboard/listings/${params.listing}/stats`,
    name: "Stats",
  }),
  id: "dashboard-listings-stats",
}

export async function loader({ params, context }: LoaderFunctionArgs) {
  const db = context.db
  const { listing: sku } = zx.parseParams(params, {
    listing: z.coerce.number(),
  })

  const listing = await db.listing.findUnique({ where: { sku } })

  if (!listing) {
    throw notFound({ message: "Listing not found" })
  }

  const [purchaseAggregates, largestPurchase, lastPurchase, itemAggregates] =
    await Promise.all([
      db.purchase.aggregate({
        _avg: { cost: true, total: true },
        _count: true,
        _sum: { cost: true, total: true },
        where: {
          listingId: listing.id,
          paid: true,
        },
      }),
      db.purchase.findFirst({
        orderBy: { total: "desc" },
        where: {
          listingId: listing.id,
          paid: true,
        },
      }),
      db.purchase.findFirst({
        orderBy: { createdAt: "desc" },
        where: {
          listingId: listing.id,
          paid: true,
        },
      }),
      db.item.aggregate({
        _count: true,
        _sum: { quantity: true, stock: true },
        where: {
          listingId: listing.id,
        },
      }),
    ])

  return json([
    {
      data: [
        {
          label: "Purchases",
          value: purchaseAggregates._count,
        },
        {
          label: "Total Purchase Amount",
          value: currency(purchaseAggregates._sum.total || 0).format({
            symbol: getPriceSymbol(),
          }),
        },
        {
          label: "Average Purchase Amount",
          value: currency(purchaseAggregates._avg.total || 0).format({
            symbol: getPriceSymbol(),
          }),
        },
        {
          label: "Largest Purchase Amount",
          value: currency(largestPurchase?.total || 0).format({
            symbol: getPriceSymbol(),
          }),
        },
        {
          label: "Last Purchase",
          value: lastPurchase?.createdAt
            ? format(lastPurchase?.createdAt, "MMM d, yyyy")
            : "N/A",
        },
      ],
      title: "Purchases",
    },
    {
      data: [
        {
          label: "Unique Items",
          value: itemAggregates._count,
        },
        {
          label: "Total Stock",
          value: itemAggregates._sum.quantity || 0,
        },
        {
          label: "Remaining Stock",
          value: itemAggregates._sum.stock || 0,
        },
      ],
      title: "Items",
    },
    {
      data: [
        {
          label: "Total Revenue",
          value: currency(purchaseAggregates._sum.total || 0)
            .subtract(purchaseAggregates._sum.cost || 0)
            .format({ symbol: getPriceSymbol() }),
        },
        {
          label: "Shopify Fees",
          value: currency(purchaseAggregates._sum.total || 0)
            .multiply(SHOPIFY_FEE)
            .divide(100)
            .format({ symbol: getPriceSymbol() }),
        },
        {
          label: "Credit Card Fees",
          value: currency(purchaseAggregates._sum.total || 0)
            .multiply(CREDIT_CARD_FEE)
            .divide(100)
            .format({ symbol: getPriceSymbol() }),
        },
        {
          label: "Shipping Charges",
          value: currency(purchaseAggregates._count)
            .multiply(SHIPPING_FEE)
            .format({
              symbol: getPriceSymbol(),
            }),
        },
        {
          label: "Estimated Profit",
          value: currency(purchaseAggregates._count)
            .multiply(SHIPPING_FEE)
            .multiply(1 - SHOPIFY_FEE / 100)
            .multiply(1 - CREDIT_CARD_FEE / 100)
            .format({ symbol: getPriceSymbol() }),
        },
      ],
      title: "Revenue",
    },
  ])
}

export default function DashboardListingStatsPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <div className="mt-8 space-y-6">
      {data.map((item) => (
        <section key={item.title}>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {item.title}
          </h3>
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {item.data.map((stat) => (
              <div
                className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
                key={stat.label}
              >
                <dt className="truncate text-sm font-medium text-gray-500">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
