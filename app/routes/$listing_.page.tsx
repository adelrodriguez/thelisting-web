import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { notFound } from "remix-utils"

import type { NotFoundBoundaryData } from "~/components/error"
import { Ribbons } from "~/components/ribbons"
import { isProduction } from "~/config/vars"
import {
  CLOUDFLARE_IMAGE_VARIANTS,
  generateCloudflareImageUrl,
} from "~/utils/cloudflare"
import type { MetaFunction } from "~/utils/remix"
import { getParam, json, useLoaderData } from "~/utils/remix"

export async function loader({ params, context }: LoaderArgs) {
  const db = context.db
  const path = getParam(params, "listing")

  // TODO(adelrodriguez): Remove this when ribbons are ready
  if (isProduction) {
    throw redirect(`/${path}`, { status: 302 })
  }

  const listing = await db.listing.findFirst({
    include: {
      items: {
        orderBy: { sku: "asc" },
      },
      ribbons: {
        orderBy: { position: "asc" },
      },
    },
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

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  try {
    return {
      description: data.listing.subtitle || "",
      "og:description": data.listing.subtitle || "",
      ...(data.listing.coverImage
        ? {
            "og:image": generateCloudflareImageUrl(
              data.listing.coverImage,
              CLOUDFLARE_IMAGE_VARIANTS.Thumbnail
            ),
          }
        : {}),
      "og:title": `${data.listing.title} | The Listing`,
      title: `${data.listing.title} | The Listing`,
    }
  } catch (error) {
    return {}
  }
}

export default function ListingPage() {
  const { listing } = useLoaderData<typeof loader>()

  return (
    <main className="flex flex-1">
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="sticky inset-0 h-screen w-full object-cover object-center"
          src={
            listing.coverImage
              ? generateCloudflareImageUrl(listing.coverImage, "display")
              : "https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
          }
          alt=""
        />
        <div className="fixed left-10 bottom-[10%] text-white">
          <h1 className="mb-4 font-header text-5xl font-bold">
            {listing.title}
          </h1>
          <h3 className="font-body text-2xl">{listing.subtitle}</h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center shadow-xl lg:w-1/3 lg:flex-none">
        <Ribbons ribbons={listing.ribbons} />
      </div>
    </main>
  )
}
