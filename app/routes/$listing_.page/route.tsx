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
import { CoverImagePropertiesSchema, RibbonSchema } from "~/utils/ribbons"

import Banner from "./Banner"
import Countdown from "./Countdown"
import CoverImage from "./CoverImage"
import ImageCarousel from "./ImageCarousel"
import ImageGallery from "./ImageGallery"
import { ThemeProvider } from "./ThemeProvider"

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
      const result = CoverImagePropertiesSchema.safeParse(ribbon.properties)

      if (!result.success) return acc

      acc.push(result.data.image)
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
    <ThemeProvider listing={listing}>
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
        <div className="z-10 flex flex-1 flex-col justify-center shadow-xl shadow-gray-700 lg:w-2/5 lg:flex-none">
          {listing.ribbons.map((ribbon) => {
            const result = RibbonSchema.safeParse(ribbon)

            if (!result.success) return null

            switch (result.data.type) {
              case RibbonType.Banner: {
                return <Banner {...result.data.properties} key={ribbon.id} />
              }
              case RibbonType.Countdown: {
                return <Countdown {...result.data.properties} key={ribbon.id} />
              }
              case RibbonType.CoverImage: {
                return (
                  <CoverImage
                    {...result.data.properties}
                    key={ribbon.id}
                    onView={handleImageChange}
                  />
                )
              }
              case RibbonType.ImageCarousel: {
                return (
                  <ImageCarousel {...result.data.properties} key={ribbon.id} />
                )
              }
              case RibbonType.ImageGallery: {
                return (
                  <ImageGallery {...result.data.properties} key={ribbon.id} />
                )
              }
              default:
                return null
            }
          })}
        </div>
      </main>
    </ThemeProvider>
  )
}
