import { Link } from "@remix-run/react"

import { Button } from "~/components/common"
import prisma from "~/helpers/prisma.server"
import { json, useLoaderData } from "~/utils/remix"

export async function loader() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      items: {
        select: { id: true },
      },
      sku: true,
      title: true,
    },
    take: 100,
  })

  return json({ listings })
}

export default function DashboardListingsPage() {
  const { listings } = useLoaderData<typeof loader>()

  return (
    <>
      <ul className="flex flex-col gap-y-4">
        {listings.map((listing) => (
          <li key={listing.id}>
            <Link to={`/dashboard/listings/${listing.sku}/`}>
              {listing.title} {listing.items.length}
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/dashboard/listings/new">
        <Button>Create Listing</Button>
      </Link>
    </>
  )
}
