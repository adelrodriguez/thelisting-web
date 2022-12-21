import type { Listing } from "@prisma/client"
import type { LoaderArgs, TypedResponse } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import db from "~/helpers/db.server"
import { ReasonPhrases, StatusCodes } from "~/utils/http"

type LoaderResult<T> = Promise<TypedResponse<T>>

export async function loader({ params }: LoaderArgs): LoaderResult<Listing> {
  const { listing } = params

  if (!listing) return redirect("/")

  const data = await db.listing.findFirst({
    where: { path: listing },
  })

  if (!data) {
    throw new Response(ReasonPhrases.NOT_FOUND, {
      status: StatusCodes.NOT_FOUND,
      statusText: "Sorry, we couldn’t find the page you’re looking for.",
    })
  }

  return json(data)
}

export default function ListingPage() {
  const listing = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>Listing</h1>
      <div>This the listing: {listing.title}</div>
      <div>Listing data: {listing.eventDate}</div>
    </div>
  )
}
