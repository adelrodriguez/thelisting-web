import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import clsx from "clsx"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { z } from "zod"
import { zx } from "zodix"

import { Image } from "~/components/common"
import { THE_LISTING_LOGO_BLACK } from "~/config/consts"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import { CartProvider } from "~/utils/hooks"

import Registry from "./Registry"

export async function loader({ params, context }: LoaderArgs) {
  const db = context.db
  const { listing: path } = zx.parseParams(params, { listing: z.string() })

  const listing = await db.listing.findFirst({
    include: {
      items: {
        orderBy: { sku: "asc" },
      },
    },
    where: { path, status: "Published" },
  })

  if (!listing) {
    throw json(
      {
        message: "Sorry, we couldn’t find the page you’re looking for.",
        title: "Not Found",
      },
      {
        status: StatusCodes.NOT_FOUND,
        statusText: ReasonPhrases.NOT_FOUND,
      }
    )
  }

  return json({ listing })
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  try {
    return [
      { title: `${data.listing.title} | The Listing` },
      { content: data.listing.subtitle, name: "description" },
      { content: data.listing.subtitle, name: "og:description" },
      { charSet: "utf-8" },
      {
        content: data.listing.coverImage
          ? generateCloudflareImageUrl(data.listing.coverImage)
          : "", // TODO(adelrodriguez): Add default image
        name: "og:image",
      },
      { content: `${data.listing.title} | The Listing`, name: "og:title" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
    ]
  } catch (error) {
    return []
  }
}

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
                <Image
                  className="h-full w-full object-cover object-center"
                  src={generateCloudflareImageUrl(
                    listing.coverImage,
                    "display"
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
        <div className="mx-4 py-16 sm:mx-12 xl:px-32 2xl:px-64">
          <Registry items={listing.items} />
        </div>
        <Outlet context={listing} />
      </main>
    </CartProvider>
  )
}
