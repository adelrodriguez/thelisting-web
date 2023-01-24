import type { LoaderArgs } from "@remix-run/node"
import { Link, Outlet } from "@remix-run/react"

import { Registry } from "~/components/registry"
import prisma from "~/helpers/prisma.server"
import { CartProvider } from "~/utils/hooks"
import { ReasonPhrases, StatusCodes } from "~/utils/http.server"
import { goHome, json, useLoaderData } from "~/utils/remix"

export async function loader({ params }: LoaderArgs) {
  const path = params.listing

  if (!path) return goHome()

  const listing = await prisma.listing.findFirst({
    include: { items: true },
    where: { path, status: "Published" },
  })

  if (!listing) {
    throw json("Sorry, we couldn’t find the Listing you’re looking for.", {
      status: StatusCodes.NOT_FOUND,
      statusText: ReasonPhrases.NOT_FOUND,
    })
  }

  return json(listing)
}

export default function ListingPage() {
  const listing = useLoaderData<typeof loader>()

  return (
    <CartProvider listing={listing.id}>
      <main>
        <h1>Listing</h1>
        <div>This the listing: {listing.title}</div>
        <div>Listing data: {listing.eventDate.toDateString()}</div>
        <div className="mx-16">
          <Registry items={listing.items} />
        </div>
        <Link to="cart" prefetch="intent">
          <button>Go to cart</button>
        </Link>
        <Link to="/testing" prefetch="intent">
          <button>Go to /testing</button>
        </Link>
        <Link to="/hello" prefetch="intent">
          <button>Go to /hello</button>
        </Link>
        <Outlet context={listing} />
      </main>
    </CartProvider>
  )
}
