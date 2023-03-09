import { ListingStatus, UserRole } from "@prisma/client"
import currency from "currency.js"
import { format } from "date-fns"

import prisma from "~/helpers/prisma.server"
import { getPriceSymbol } from "~/utils/money"
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
    prisma.user.count({
      where: { role: UserRole.User },
    }),
    prisma.user.count({
      where: { role: UserRole.Admin },
    }),
    prisma.listing.count({
      where: { status: ListingStatus.Published },
    }),
    prisma.listing.count({
      where: { status: ListingStatus.Draft },
    }),
    prisma.$queryRaw<
      {
        average: unknown
      }[]
    >`SELECT AVG(subquery.count) as average FROM (SELECT COUNT(*) as count FROM "Item" GROUP BY "listingId") subquery;`,
    prisma.purchase.count(),
    prisma.purchase.aggregate({
      _avg: { total: true },
      _sum: { total: true },
    }),
    prisma.purchase.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ])

  return json([
    {
      stats: [
        { name: "Published Listings", stat: publishedListings },
        { name: "Draft Listings", stat: draftListings },
        { name: "Total Listings", stat: publishedListings + draftListings },
        { name: "Average Items per Listing", stat: Number(item[0]!.average) },
        { name: "Total Purchases", stat: purchases },
        {
          name: "Total Purchase Amount",
          stat: currency(purchaseAmount._sum.total || 0)
            .format({ symbol: getPriceSymbol() })
            .toString(),
        },
        {
          name: "Average Purchase Amount",
          stat: currency(purchaseAmount._avg.total || 0)
            .format({ symbol: getPriceSymbol() })
            .toString(),
        },
        {
          name: "Last Purchase",
          stat: lastPurchase?.createdAt
            ? format(lastPurchase?.createdAt, "MMM d, yyyy")
            : "N/A",
        },
      ],
      title: "Listings (All Time)",
    },
    {
      stats: [
        { name: "Total Users", stat: users },
        { name: "Total Admins", stat: admins },
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
            {item.stats.map((stat) => (
              <div
                key={stat.name}
                className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
              >
                <dt className="truncate text-sm font-medium text-gray-500">
                  {stat.name}
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                  {stat.stat}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
