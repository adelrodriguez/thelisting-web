import { RibbonType } from "@prisma/client"
import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useState } from "react"
import { notFound } from "remix-utils"

import type { NotFoundBoundaryData } from "~/components/error"
import { isProduction } from "~/config/vars"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import type { MetaFunction } from "~/utils/remix"
import { getParam, json, useLoaderData } from "~/utils/remix"
import {
  parseBannerProperties,
  parseCountdownProperties,
  parseCoverImageProperties,
} from "~/utils/ribbons"

import Banner from "./Banner"
import Countdown from "./Countdown"
import CoverImage from "./CoverImage"

export async function loader({ params, context }: LoaderArgs) {
  const db = context.db
  const path = getParam(params, "listing")

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

  // TODO(adelrodriguez): Remove this when ribbons are ready
  // Only see pages for internal pages in production
  if (isProduction && !listing.isInternal) {
    throw redirect(`/${path}`, { status: 302 })
  }

  const coverImages = listing.ribbons.reduce((acc: string[], ribbon) => {
    if (ribbon.type === RibbonType.CoverImage) {
      const result = parseCoverImageProperties(ribbon.properties)

      if (result.success) acc.push(result.data.image)
    }
    return acc
  }, [])

  return json({ coverImages, listing })
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
              "thumbnail"
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
  const { listing, coverImages } = useLoaderData<typeof loader>()
  const [currentImage, setCurrentImage] = useState(coverImages[0])
  const handleImageChange = useCallback((image: string) => {
    setCurrentImage(image)
  }, [])

  return (
    <main className="flex flex-1">
      <div className="relative hidden w-0 flex-1 lg:block">
        <AnimatePresence>
          <motion.img
            key={currentImage!}
            src={generateCloudflareImageUrl(currentImage!, "display")}
            alt={`Image ${currentImage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="sticky inset-0 h-screen w-full object-cover object-center"
          />
        </AnimatePresence>

        <div className="fixed left-10 bottom-[10%] text-white">
          <h1 className="mb-4 font-header text-5xl font-bold">
            {listing.title}
          </h1>
          <h3 className="font-body text-2xl">{listing.subtitle}</h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center shadow-xl lg:w-1/3 lg:flex-none">
        {listing.ribbons.map((ribbon) => {
          switch (ribbon.type) {
            case RibbonType.Banner: {
              const result = parseBannerProperties(ribbon.properties)

              if (!result.success) return null

              return <Banner {...result.data} key={ribbon.id} />
            }
            case RibbonType.Countdown: {
              const result = parseCountdownProperties(ribbon.properties)

              if (!result.success) return null

              return <Countdown {...result.data} key={ribbon.id} />
            }
            case RibbonType.CoverImage: {
              const result = parseCoverImageProperties(ribbon.properties)

              if (!result.success) return null

              return (
                <CoverImage
                  {...result.data}
                  key={ribbon.id}
                  onView={handleImageChange}
                />
              )
            }
            default:
              return null
          }
        })}
      </div>
    </main>
  )
}
