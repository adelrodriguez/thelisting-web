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
  const { listing } = params

  if (!listing) return redirect("/")

  const data = await prisma.listing.findFirst({
    include: { items: true },
    where: { path: listing, status: "Published" },
  })

  if (!data) {
    throw json("Sorry, we couldn’t find the page you’re looking for.", {
      status: StatusCodes.NOT_FOUND,
      statusText: ReasonPhrases.NOT_FOUND,
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
      <ul>
        {listing.items.map((item) => (
          <li key={item.id}>
            <ListingItem {...item} />
          </li>
        ))}
      </ul>
      <Link to="cart" prefetch="intent">
        <button>Go to cart</button>
      </Link>
      <Outlet />
    </div>
  )
}
