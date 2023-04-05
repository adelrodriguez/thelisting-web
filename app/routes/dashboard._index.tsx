import { ListingStatus, UserRole } from "@prisma/client"
import currency from "currency.js"
import { format, sub } from "date-fns"

import { CREDIT_CARD_FEE, SHIPPING_FEE, SHOPIFY_FEE } from "~/config/consts"
import db from "~/helpers/db.server"
import { getPriceSymbol } from "~/utils/money"
import { round } from "~/utils/number"
import { json, useLoaderData } from "~/utils/remix"

export async function loader() {
  const [
    users,
    admins,
    publishedListingsAllTime,
    draftListingsAllTime,
    publishedListingsLast30Days,
    draftListingsLast30Days,
    item,
    purchasesLast30Days,
    purchasesAllTime,
    purchaseVolumeLast30Days,
    purchaseVolumeAllTime,
    lastPurchase,
    purchaseAggregatesLast30Days,
    purchaseAggregatesAllTime,
  ] = await Promise.all([
    db.user.count({
      where: { role: UserRole.User },
    }),
    db.user.count({
      where: { role: UserRole.Admin },
    }),
    db.listing.count({
      where: { isInternal: false, status: ListingStatus.Published },
    }),
    db.listing.count({
      where: { isInternal: false, status: ListingStatus.Draft },
    }),
    db.listing.count({
      where: {
        createdAt: { gt: sub(Date.now(), { days: 30 }) },
        isInternal: false,
        status: ListingStatus.Published,
      },
    }),
    db.listing.count({
      where: {
        createdAt: { gt: sub(Date.now(), { days: 30 }) },
        isInternal: false,
        status: ListingStatus.Draft,
      },
    }),
    db.$queryRaw<
      {
        average: unknown
      }[]
    >`SELECT AVG(subquery.count) as average FROM (SELECT COUNT(*) as count FROM "Item" GROUP BY "listingId") subquery;`,
    db.purchase.count({
      where: {
        createdAt: { gt: sub(Date.now(), { days: 30 }) },
        listing: { isInternal: false },
      },
    }),
    db.purchase.count({
      where: { listing: { isInternal: false } },
    }),
    db.purchase.aggregate({
      _avg: { total: true },
      _sum: { total: true },
      where: {
        createdAt: { gt: sub(Date.now(), { days: 30 }) },
        listing: { isInternal: false },
      },
    }),
    db.purchase.aggregate({
      _avg: { total: true },
      _sum: { total: true },
      where: { listing: { isInternal: false } },
    }),
    db.purchase.findFirst({
      include: { listing: true },
      orderBy: { createdAt: "desc" },
      where: { listing: { isInternal: false } },
    }),
    db.purchase.aggregate({
      _avg: { cost: true, total: true },
      _count: true,
      _sum: { cost: true, total: true },
      where: {
        createdAt: { gt: sub(Date.now(), { days: 30 }) },
        listing: { isInternal: false },
      },
    }),
    db.purchase.aggregate({
      _avg: { cost: true, total: true },
      _count: true,
      _sum: { cost: true, total: true },
      where: {
        listing: { isInternal: false },
      },
    }),
  ])

  return json([
    {
      data: [
        { label: "Published Listings", value: publishedListingsLast30Days },
        { label: "Draft Listings", value: draftListingsLast30Days },
      ],
      title: "Listings (Last 30 Days)",
    },
    {
      data: [
        {
          label: "Total Purchases",
          value: purchasesLast30Days,
        },
        {
          label: "Total Purchase Volume",
          value: currency(purchaseVolumeLast30Days._sum.total || 0).format({
            symbol: getPriceSymbol(),
          }),
        },
        {
          label: "Average Purchase Volume",
          value: currency(purchaseVolumeLast30Days._avg.total || 0).format({
            symbol: getPriceSymbol(),
          }),
        },
        {
          label: "Last Purchase",
          value: lastPurchase?.createdAt
            ? format(lastPurchase?.createdAt, "MMM d, yyyy")
            : "N/A",
        },
        {
          label: "Last Purchase Listing",
          value: lastPurchase?.listing?.sku || "N/A",
        },
      ],
      title: "Purchases (Last 30 Days)",
    },
    {
      data: [
        {
          label: "Total Revenue",
          value: currency(purchaseAggregatesLast30Days._sum.total || 0)
            .subtract(purchaseAggregatesLast30Days._sum.cost || 0)
            .format({ symbol: getPriceSymbol() }),
        },
        {
          label: "Shopify Fees",
          value: currency(purchaseAggregatesLast30Days._sum.total || 0)
            .multiply(SHOPIFY_FEE)
            .divide(100)
            .format({ symbol: getPriceSymbol() }),
        },
        {
          label: "Credit Card Fees",
          value: currency(purchaseAggregatesLast30Days._sum.total || 0)
            .multiply(CREDIT_CARD_FEE)
            .divide(100)
            .format({ symbol: getPriceSymbol() }),
        },
        {
          label: "Shipping Charges",
          value: currency(purchaseAggregatesLast30Days._count)
            .multiply(SHIPPING_FEE)
            .format({
              symbol: getPriceSymbol(),
            }),
        },
        {
          label: "Estimated Profit",
          value: currency(purchaseAggregatesLast30Days._count)
            .multiply(SHIPPING_FEE)
            .multiply(1 - SHOPIFY_FEE / 100)
            .multiply(1 - CREDIT_CARD_FEE / 100)
            .format({ symbol: getPriceSymbol() }),
        },
      ],
      title: "Revenue (Last 30 Days)",
    },

    {
      data: [
        { label: "Published Listings", value: publishedListingsAllTime },
        { label: "Draft Listings", value: draftListingsAllTime },
        {
          label: "Total Listings",
          value: publishedListingsAllTime + draftListingsAllTime,
        },
        {
          label: "Average Items per Listing",
          value: round(Number(item[0]!.average)),
        },
      ],
      title: "Listings (All Time)",
    },

    {
      data: [
        { label: "Total Purchases", value: purchasesAllTime },
        {
          label: "Total Purchase Volume",
          value: currency(purchaseVolumeAllTime._sum.total || 0).format({
            symbol: getPriceSymbol(),
          }),
        },
        {
          label: "Average Purchase Volume",
          value: currency(purchaseVolumeAllTime._avg.total || 0).format({
            symbol: getPriceSymbol(),
          }),
        },
      ],
      title: "Purchases (All Time)",
    },
    {
      data: [
        {
          label: "Total Revenue",
          value: currency(purchaseAggregatesAllTime._sum.total || 0)
            .subtract(purchaseAggregatesAllTime._sum.cost || 0)
            .format({ symbol: getPriceSymbol() }),
        },
        {
          label: "Shopify Fees",
          value: currency(purchaseAggregatesAllTime._sum.total || 0)
            .multiply(SHOPIFY_FEE)
            .divide(100)
            .format({ symbol: getPriceSymbol() }),
        },
        {
          label: "Credit Card Fees",
          value: currency(purchaseAggregatesAllTime._sum.total || 0)
            .multiply(CREDIT_CARD_FEE)
            .divide(100)
            .format({ symbol: getPriceSymbol() }),
        },
        {
          label: "Shipping Charges",
          value: currency(purchaseAggregatesAllTime._count)
            .multiply(SHIPPING_FEE)
            .format({
              symbol: getPriceSymbol(),
            }),
        },
        {
          label: "Estimated Profit",
          value: currency(purchaseAggregatesAllTime._count)
            .multiply(SHIPPING_FEE)
            .multiply(1 - SHOPIFY_FEE / 100)
            .multiply(1 - CREDIT_CARD_FEE / 100)
            .format({ symbol: getPriceSymbol() }),
        },
      ],
      title: "Revenue (All Time)",
    },
    {
      data: [
        { label: "Total Users", value: users },
        { label: "Total Admins", value: admins },
      ],
      title: "Users",
    },
  ])
}

export default function DashboardIndexPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <div className="space-y-6">
      {data.map((item) => (
        <section key={item.title}>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {item.title}
          </h3>
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {item.data.map((stat) => (
              <div
                key={stat.label}
                className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
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
