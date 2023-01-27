import { Link } from "@remix-run/react"

import { Button } from "~/components/common"
import prisma from "~/helpers/prisma.server"
import { json, useLoaderData } from "~/utils/remix"

export async function loader() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return json(listings)
}

export default function DashboardListingsPage() {
  const listings = useLoaderData<typeof loader>()

  return (
    <>
      <ul>
        {listings.map((listing) => (
          <li key={listing.id}>
            <Link to={`/dashboard/listings/${listing.path}`}>
              {listing.title}
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
