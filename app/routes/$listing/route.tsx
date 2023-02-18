import type { LoaderArgs, MetaFunction } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import clsx from "clsx"
import { notFound } from "remix-utils"

import type { NotFoundBoundaryData } from "~/components/error"
import { Ribbons } from "~/components/ribbons"
import { THE_LISTING_LOGO_BLACK } from "~/config/consts"
import prisma from "~/helpers/prisma.server"
import {
  CLOUDFLARE_IMAGE_VARIANTS,
  generateCloudflareImageUrl,
} from "~/utils/cloudflare"
import { CartProvider } from "~/utils/hooks"
import { goHome, json, useLoaderData } from "~/utils/remix"

import Registry from "./Registry"

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

export const meta: MetaFunction<typeof loader> = ({ data }) => ({
  description: data?.listing?.subtitle || "",
  "og:description": data?.listing?.subtitle || "",
  ...(data?.listing.coverImage
    ? {
        "og:image": generateCloudflareImageUrl(
          data.listing.coverImage,
          CLOUDFLARE_IMAGE_VARIANTS.Thumbnail
        ),
      }
    : {}),
  "og:title": `${data?.listing?.title} | The Listing` || "The Listing",
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
        <section>
          <div className="relative bg-gray-800">
            <div className="absolute inset-0">
              {listing.coverImage && (
                <img
                  className="h-full w-full object-cover object-center"
                  src={generateCloudflareImageUrl(
                    listing.coverImage,
                    CLOUDFLARE_IMAGE_VARIANTS.Public
                  )}
                  alt=""
                />
              )}

              <div
                className={clsx("absolute inset-0 bg-gray-500", {
                  "mix-blend-multiply": !!listing.coverImage,
                })}
                aria-hidden="true"
              />
            </div>
            <div className="relative mx-auto max-w-7xl py-16 px-6 md:py-24 lg:py-32 lg:px-8">
              <h1 className="font-headline text-4xl font-bold text-white sm:text-5xl md:text-center lg:text-6xl">
                {listing.title}
              </h1>
              {listing.subtitle && (
                <p className="mt-2 font-body text-lg text-white md:text-center md:text-xl">
                  {listing.subtitle}
                </p>
              )}
            </div>
          </div>
        </section>
        <Ribbons ribbons={listing.ribbons} />
        <div className="mx-4 py-16 sm:mx-12 xl:px-32 2xl:px-64">
          <Registry items={listing.items} />
        </div>

        <Outlet context={listing} />
      </main>
    </CartProvider>
  )
}
