import type { LoaderArgs, MetaFunction } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import { notFound } from "remix-utils"

import type { NotFoundBoundaryData } from "~/components/error"
import { Registry } from "~/components/registry"
import { Ribbons } from "~/components/ribbons"
import { THE_LISTING_LOGO_BLACK } from "~/config/consts"
import prisma from "~/helpers/prisma.server"
import { CartProvider } from "~/utils/hooks"
import { goHome, json, useLoaderData } from "~/utils/remix"

export async function loader({ params }: LoaderArgs) {
  const path = params.listing

  if (!path) return goHome()

  const listing = await prisma.listing.findFirst({
    include: { items: true, ribbons: true },
    where: { path, status: "Published" },
  })

  if (!listing) {
    throw notFound<NotFoundBoundaryData>({
      message: "Sorry, we couldn’t find the page you’re looking for.",
      title: "Not Found",
    })
  }

  return json({ listing })
}

export const meta: MetaFunction = ({ data }) => ({
  title: `${data?.listing?.title} | The Listing` || "The Listing",
})

export default function ListingPage() {
  const { listing } = useLoaderData<typeof loader>()

  return (
    <CartProvider listing={listing.id}>
      <main className="relative">
        <div className="sticky top-0 z-20 h-16 w-full bg-white p-3 drop-shadow-md lg:h-20 lg:p-4">
          <img
            src={THE_LISTING_LOGO_BLACK}
            alt="The Listing"
            className="mx-auto h-full"
          />
        </div>
        <Ribbons ribbons={listing.ribbons} />
        <div className="mx-4 py-16 sm:mx-12 xl:px-32 2xl:px-64">
          <Registry items={listing.items} />
        </div>

        <Outlet context={listing} />
      </main>
    </CartProvider>
  )
}
