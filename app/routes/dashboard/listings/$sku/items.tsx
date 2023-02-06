import type { LoaderArgs } from "@remix-run/node"

import prisma from "~/helpers/prisma.server"
import { NotFound } from "~/utils/http.server"
import { json, useLoaderData } from "~/utils/remix"

export const handle = {
  id: "dashboard-listings-items",
}

export async function loader({ params }: LoaderArgs) {
  const sku = params.sku

  if (!sku) throw NotFound

  if (isNaN(Number(sku))) throw NotFound

  const listing = await prisma.listing.findUnique({
    include: { items: true },
    where: { sku: Number(sku) },
  })

  if (!listing) throw NotFound

  return json(listing)
}

export default function DashboardListingItemsPage() {
  const listing = useLoaderData<typeof loader>()
  return (
    <ul className="flex flex-col gap-y-4">
      {listing.items.map((item) => (
        <li key={item.id}>{item.id}</li>
      ))}
    </ul>
  )
}
