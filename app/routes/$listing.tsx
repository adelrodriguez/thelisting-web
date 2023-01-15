import type { Listing, Item } from "@prisma/client"
import type { LoaderArgs, TypedResponse } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, Outlet, useLoaderData } from "@remix-run/react"

import { ListingItem } from "~/components/listing"
import prisma from "~/helpers/prisma.server"
import { ReasonPhrases, StatusCodes } from "~/utils/http.server"

type LoaderResult<T> = Promise<TypedResponse<T>>

export async function loader({ params }: LoaderArgs): LoaderResult<
  Listing & {
    items: Item[]
  }
> {
  const path = params.listing

  if (!path) return redirect("/")

  const listing = await prisma.listing.findFirst({
    include: { items: true },
    where: { path, status: "Published" },
  })

  if (!listing) {
    throw json("Sorry, we couldn’t find the page you’re looking for.", {
      status: StatusCodes.NOT_FOUND,
      statusText: ReasonPhrases.NOT_FOUND,
    })
  }

  return json(listing)
}

export default function ListingPage() {
  const listing = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>Listing</h1>
      <div>This the listing: {listing.title}</div>
      <div>Listing data: {listing.eventDate}</div>
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {listing.items.map((item) => {
          if (!item.commerceId) return null

          return (
            <ListingItem
              commerceId={item.commerceId}
              id={item.id}
              key={item.id}
              title={item.title}
            />
          )
        })}
      </div>
      <Link to="cart" prefetch="intent">
        <button>Go to cart</button>
      </Link>
      <Outlet />
    </div>
  )
}
