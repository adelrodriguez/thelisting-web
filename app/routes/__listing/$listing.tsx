import type { LoaderArgs } from "@remix-run/node"
import { Outlet } from "@remix-run/react"

import { Registry } from "~/components/registry"
import { Hero } from "~/components/sections"
import { THE_LISTING_LOGO_BLACK } from "~/config/consts"
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
      <main className="relative">
        <div className="h-16 p-3 lg:h-20 w-full bg-white drop-shadow-md lg:p-4 sticky top-0 z-20">
          <img
            src={THE_LISTING_LOGO_BLACK}
            alt="The Listing"
            className="h-full mx-auto"
          />
        </div>
        <Hero>{listing.title}</Hero>
        <div className="py-16 mx-4 sm:mx-12">
          <Registry items={listing.items} />
        </div>

        <Outlet context={listing} />
      </main>
    </CartProvider>
  )
}
