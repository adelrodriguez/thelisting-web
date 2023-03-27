import { ListingStatus, UserRole } from "@prisma/client"
import currency from "currency.js"
import { format } from "date-fns"

import db from "~/helpers/db.server"
import { getPriceSymbol } from "~/utils/money"
import { round } from "~/utils/number"
import { json, useLoaderData } from "~/utils/remix"

export async function loader() {
  const [
    users,
    admins,
    publishedListings,
    draftListings,
    item,
    purchases,
    purchaseAmount,
    lastPurchase,
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
    db.$queryRaw<
      {
        average: unknown
      }[]
    >`SELECT AVG(subquery.count) as average FROM (SELECT COUNT(*) as count FROM "Item" GROUP BY "listingId") subquery;`,
    db.purchase.count({
      where: { listing: { isInternal: false } },
    }),
    db.purchase.aggregate({
      _avg: { total: true },
      _sum: { total: true },
      where: { listing: { isInternal: false } },
    }),
    db.purchase.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
      where: { listing: { isInternal: false } },
    }),
  ])

  return json([
    {
      data: [
        { label: "Published Listings", value: publishedListings },
        { label: "Draft Listings", value: draftListings },
        { label: "Total Listings", value: publishedListings + draftListings },
        {
          label: "Average Items per Listing",
          value: round(Number(item[0]!.average)),
        },
        { label: "Total Purchases", value: purchases },
        {
          label: "Total Purchase Amount",
          value: currency(purchaseAmount._sum.total || 0).format({
            symbol: getPriceSymbol(),
          }),
        },
        {
          label: "Average Purchase Amount",
          value: currency(purchaseAmount._avg.total || 0).format({
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
      title: "Listings (All Time)",
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
