import type { LoaderArgs } from "@remix-run/node"

import prisma from "~/helpers/prisma.server"
import { NotFound } from "~/utils/http.server"
import { json, useLoaderData } from "~/utils/remix"

export const handle = {
  id: "dashboard-listings-ribbons",
}

export async function loader({ params }: LoaderArgs) {
  const sku = params.sku

  if (!sku) throw NotFound

  if (isNaN(Number(sku))) throw NotFound

  const listing = await prisma.listing.findUnique({
    include: { ribbons: true },
    where: { sku: Number(sku) },
  })

  if (!listing) throw NotFound

  return json(listing)
}

export default function DashboardListingRibbonsPage() {
  const listing = useLoaderData<typeof loader>()

  return (
    <ul className="flex flex-col gap-y-4">
      {listing.ribbons.map((ribbon) => (
        <li key={ribbon.id}>{ribbon.id}</li>
      ))}
    </ul>
  )
}
