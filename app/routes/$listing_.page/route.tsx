import { RibbonType } from "@prisma/client"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import clsx from "clsx"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { z } from "zod"
import { zx } from "zodix"

import { isProduction } from "~/config/vars"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import { generateGoogleFontsUrl } from "~/utils/font"
import { notFound } from "~/utils/http"
import { ListingThemeSchema } from "~/utils/listing"
import { CoverImageProperties, Ribbon } from "~/utils/ribbons"

import Banner from "./Banner"
import Countdown from "./Countdown"
import CoverImage from "./CoverImage"
import ImageCarousel from "./ImageCarousel"
import ImageGallery from "./ImageGallery"
import Location from "./Location"
import SectionWrapper from "./SectionWrapper"
import Text from "./Text"
import { ThemeProvider } from "./ThemeProvider"

export async function loader({ context, params }: LoaderFunctionArgs) {
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

  const theme = ListingThemeSchema.parse(listing.theme)

  // TODO(adelrodriguez): Remove this when ribbons are ready
  // Only see pages for internal pages in production
  if (isProduction && !listing.isInternal) {
    throw redirect(`/${path}`, { status: 302 })
  }

  // Get all the cover images plus their index
  const coverImages = listing.ribbons.reduce(
    (acc: { id: string; index: number }[], ribbon, index) => {
      if (ribbon.type === RibbonType.CoverImage) {
        const result = CoverImageProperties.safeParse(ribbon.properties)

        if (!result.success) return acc

        acc.push({ id: result.data.image, index })
      }

      return acc
    },
    [],
  )

  return json({ coverImages, listing, theme })
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
  const { coverImages, listing, theme } = useLoaderData<typeof loader>()
  const [cover, setCover] = useState(coverImages[0])

  function handleSectionChange(index: number) {
    const newCover = coverImages.find((cover) => cover.index >= index)

    if (!newCover) return

    setCover(newCover)
  }

  return (
    <ThemeProvider theme={theme}>
      <main className="flex flex-1">
        <div className="relative hidden w-0 flex-1 lg:block">
          <AnimatePresence>
            {cover && (
              <motion.img
                alt={`Image ${cover.id}`}
                animate={{ opacity: 1 }}
                className="sticky inset-0 h-screen w-full object-cover object-center"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key={cover?.id}
                src={generateCloudflareImageUrl(cover.id, "display")}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>

          <div
            aria-hidden="true"
            className={clsx("absolute inset-0 bg-gray-300", {
              "mix-blend-multiply": !!cover?.id,
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
          className="z-10 overflow-hidden shadow-gray-700 lg:w-2/5 lg:flex-none lg:border-l-8"
          style={{
            backgroundColor: theme.colors?.background,
            borderColor: theme.colors?.secondary,
            color: theme.colors?.text,
          }}
        >
          {listing.ribbons.map((ribbon, index) => {
            const result = Ribbon.safeParse(ribbon)

            if (!result.success) return null

            return (
              <SectionWrapper
                key={ribbon.id}
                mobileOnly={ribbon.type === RibbonType.CoverImage}
                onView={() => {
                  handleSectionChange(index)
                }}
              >
                <Ribbons ribbon={result.data} />
              </SectionWrapper>
            )
          })}
        </div>
      </main>
    </ThemeProvider>
  )
}

export function Ribbons({ ribbon }: { ribbon: Ribbon }) {
  switch (ribbon.type) {
    case RibbonType.Banner: {
      return <Banner {...ribbon.properties} />
    }
    case RibbonType.Countdown: {
      return <Countdown {...ribbon.properties} />
    }
    case RibbonType.CoverImage: {
      return <CoverImage {...ribbon.properties} />
    }
    case RibbonType.ImageCarousel: {
      return <ImageCarousel {...ribbon.properties} />
    }
    case RibbonType.ImageGallery: {
      return <ImageGallery {...ribbon.properties} />
    }
    case RibbonType.Location: {
      return <Location {...ribbon.properties} />
    }
    case RibbonType.Text: {
      return <Text {...ribbon.properties} />
    }
    default:
      return null
  }
}
