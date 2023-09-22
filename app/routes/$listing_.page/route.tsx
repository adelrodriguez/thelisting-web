import { RibbonType } from "@prisma/client"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import clsx from "clsx"
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useState } from "react"
import { z } from "zod"
import { zx } from "zodix"

import { isProduction } from "~/config/vars"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import { generateGoogleFontsUrl } from "~/utils/font"
import { ListingThemeSchema } from "~/utils/listing"
import { notFound } from "~/utils/remix"
import { CoverImagePropertiesSchema, RibbonSchema } from "~/utils/ribbons"

import Banner from "./Banner"
import Countdown from "./Countdown"
import CoverImage from "./CoverImage"
import ImageCarousel from "./ImageCarousel"
import ImageGallery from "./ImageGallery"
import Location from "./Location"
import Text from "./Text"
import { ThemeProvider } from "./ThemeProvider"

export async function loader({ params, context }: LoaderFunctionArgs) {
  const db = context.db
  const { listing: path } = zx.parseParams(params, { listing: z.string() })

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
    throw notFound({
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
    if (!data) return []

    const result = ListingThemeSchema.safeParse(data.listing.theme)
    let fontURL = ""

    if (result.success) {
      fontURL = generateGoogleFontsUrl([
        result.data.fonts?.heading,
        result.data.fonts?.body,
      ])
    }

    return [
      { title: `${data.listing.title} | The Listing` },
      { content: data.listing.subtitle, name: "description" },
      { content: data.listing.subtitle, name: "og:description" },
      { charSet: "utf-8" },
      {
        // TODO(adelrodriguez): Generate OG images with
        // https://www.jacobparis.com/content/remix-og
        content: data.listing.coverImage
          ? generateCloudflareImageUrl(data.listing.coverImage)
          : "", // TODO(adelrodriguez): Add default image
        name: "og:image",
      },
      { content: `${data.listing.title} | The Listing`, name: "og:title" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { href: fontURL, rel: "stylesheet", tagName: "link" },
    ]
  } catch (error) {
    return []
  }
}

export default function ListingPage() {
  const { listing, coverImages } = useLoaderData<typeof loader>()
  const [currentImage, setCurrentImage] = useState(coverImages[0])
  const handleImageChange = useCallback((image: string) => {
    setCurrentImage(image)
  }, [])

  const theme = ListingThemeSchema.parse(listing.theme)

  return (
    <ThemeProvider theme={theme}>
      <main className="flex flex-1">
        <div className="relative hidden w-0 flex-1 lg:block">
          <AnimatePresence>
            <motion.img
              alt={`Image ${currentImage}`}
              animate={{ opacity: 1 }}
              className="sticky inset-0 h-screen w-full object-cover object-center"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key={currentImage!}
              src={generateCloudflareImageUrl(currentImage!, "display")}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
          <div
            aria-hidden="true"
            className={clsx("absolute inset-0 bg-gray-300", {
              "mix-blend-multiply": !!currentImage,
            })}
          />

          <div className="fixed bottom-[10%] left-10 text-white">
            <h1 className="mb-4 font-headline text-6xl font-bold tracking-tight">
              {listing.title}
            </h1>
            <h3 className="font-body text-2xl">{listing.subtitle}</h3>
          </div>
        </div>
        <div
          className="justify-cente z-10 flex flex-1 flex-col shadow-gray-700 lg:w-2/5 lg:flex-none lg:border-l-8"
          style={{
            backgroundColor: theme.colors?.background,
            borderColor: theme.colors?.secondary,
            color: theme.colors?.text,
          }}
        >
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
              case RibbonType.Location: {
                return <Location {...result.data.properties} key={ribbon.id} />
              }
              case RibbonType.Text: {
                return <Text {...result.data.properties} key={ribbon.id} />
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
