import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { notFound } from "remix-utils"

import type { NotFoundBoundaryData } from "~/components/error"
import { Ribbons } from "~/components/ribbons"
import { isProduction } from "~/config/vars"
import db from "~/helpers/db.server"
import {
  CLOUDFLARE_IMAGE_VARIANTS,
  generateCloudflareImageUrl,
} from "~/utils/cloudflare"
import type { MetaFunction } from "~/utils/remix"
import { getParam, json, useLoaderData } from "~/utils/remix"

export async function loader({ params }: LoaderArgs) {
  const path = getParam(params, "listing")

  // TODO(adelrodriguez): Remove this when ribbons are ready
  if (isProduction) {
    return redirect(`/${path}`, { status: 302 })
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

  return <Ribbons ribbons={listing.ribbons} />
}
