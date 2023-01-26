import type { LoaderArgs } from "@remix-run/node"
import { Outlet } from "@remix-run/react"

import { Image } from "~/components/common"
import { Registry } from "~/components/registry"
import { Header } from "~/components/sections"
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
        <div className="h-16 p-3 lg:h-20 lg:p-4">
          <Image
            src="/assets/img/the-listing-logo.png"
            alt="The Listing"
            className="h-full mx-auto"
          />
        </div>
        <Header>{listing.title}</Header>
        <div className="my-16 mx-12 sm:mx-24">
          <Registry items={listing.items} />
        </div>

        <Outlet context={listing} />
      </main>
    </CartProvider>
  )
}
