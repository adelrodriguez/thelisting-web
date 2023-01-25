import type { LoaderArgs } from "@remix-run/node"

import prisma from "~/helpers/prisma.server"
import { NotFound } from "~/utils/http.server"
import { json, useLoaderData } from "~/utils/remix"

export async function loader({ params }: LoaderArgs) {
  const path = params.listing

  const listing = await prisma.listing.findUnique({
    where: { path },
  })

  if (!listing) throw NotFound

  return json(listing)
}

export default function DashboardListingPage() {
  const data = useLoaderData<typeof loader>()

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
