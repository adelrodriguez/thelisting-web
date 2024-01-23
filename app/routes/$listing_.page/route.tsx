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
import auth from "~/helpers/auth.server"
import { generateGoogleFontsUrl, getFont } from "~/utils/font"
import { notFound, unauthorized } from "~/utils/http"
import { ListingThemeSchema } from "~/utils/listing"
import { RibbonSchema, getCoverImages } from "~/utils/ribbons"

import Banner from "./Banner"
import Countdown from "./Countdown"
import CoverImage from "./CoverImage"
import ImageCarousel from "./ImageCarousel"
import ImageGallery from "./ImageGallery"
import Location from "./Location"
import SectionWrapper from "./SectionWrapper"
import Text from "./Text"
import { ThemeProvider } from "./ThemeProvider"

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const db = context.db
  const cache = context.cache

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
    where: {
      path,
      status: {
        in: ["Draft", "Published"],
      },
    },
  })

  if (!listing) {
    throw notFound({
      message: "Sorry, we couldn’t find the page you’re looking for.",
      title: "Not Found",
    })
  }

  if (listing.status === "Draft") {
    const user = await auth.isAuthenticated(request)

    if (!user) {
      throw unauthorized({ message: "You must be logged in to view this page" })
    }
  }

  // TODO(adelrodriguez): Remove this when ribbons are ready
  // Only see pages for internal pages in production
  if (isProduction && !listing.isInternal) {
    throw redirect(`/${path}`, { status: 302 })
  }

  // Get all the cover images plus their index
  const coverImages = getCoverImages(listing.ribbons)

  const theme = ListingThemeSchema.parse(listing.theme)
  const [headingFont, bodyFont] = await Promise.all([
    theme.fonts?.heading ? getFont(cache, theme.fonts?.heading) : null,
    theme.fonts?.body ? getFont(cache, theme.fonts?.body) : null,
  ])

  const fontsUrl = generateGoogleFontsUrl([headingFont, bodyFont])

  return json({ coverImages, fontsUrl, listing, theme })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  try {
    if (!data) return []

    return [
      { title: `${data.listing.title} | The Listing` },
      { content: data.listing.subtitle, name: "description" },
      { content: data.listing.subtitle, name: "og:description" },
      { charSet: "utf-8" },
      {
        // TODO(adelrodriguez): Generate OG images with
        // https://www.jacobparis.com/content/remix-og
        content: data.listing.coverImage ?? "", // TODO(adelrodriguez): Add default image
        name: "og:image",
      },
      { content: `${data.listing.title} | The Listing`, name: "og:title" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { href: data.fontsUrl, rel: "stylesheet", tagName: "link" },
    ]
  } catch (error) {
    return []
  }
}

export default function ListingPage() {
  const { coverImages, listing, theme } = useLoaderData<typeof loader>()
  const [cover, setCover] = useState(coverImages[0])

  function handleSectionChange(position: number) {
    const newCover = coverImages.find((cover) => cover.position === position)

    if (!newCover) return

    setCover(newCover)
  }

  return (
    <ThemeProvider theme={theme}>
      <main className="md:grid md:grid-cols-5">
        <div className="relative hidden md:col-span-3 md:block">
          <AnimatePresence>
            {cover && (
              <motion.img
                alt={listing.title}
                animate={{ opacity: 1 }}
                className="sticky inset-0 h-screen w-full object-cover object-center"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key={cover.url}
                src={cover.url}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>

          <div
            aria-hidden="true"
            className={clsx("absolute inset-0 bg-gray-300", {
              "mix-blend-multiply": !!cover?.url,
            })}
          />

          <div className="fixed bottom-[10%] left-10 text-white">
            <h1 className="mb-4 font-headline text-6xl font-bold tracking-tight">
              {listing.title}
            </h1>
          </div>
        </div>
        <div
          className="z-10 w-full overflow-hidden shadow-gray-700 md:col-span-2 md:border-l-8"
          style={{
            backgroundColor: theme.colors?.background,
            borderColor: theme.colors?.secondary,
            color: theme.colors?.text,
          }}
        >
          {listing.ribbons.map((ribbon) => {
            const result = RibbonSchema.safeParse(ribbon)

            if (!result.success) {
              // TODO(adelrodriguez): Report to Sentry
              return null
            }

            return (
              <Ribbons
                key={ribbon.id}
                onView={handleSectionChange}
                ribbon={result.data}
              />
            )
          })}
        </div>
      </main>
    </ThemeProvider>
  )
}

export function Ribbons({
  onView,
  ribbon,
}: {
  ribbon: z.infer<typeof RibbonSchema>
  onView?: (position: number) => void
}) {
  switch (ribbon.type) {
    case RibbonType.Banner: {
      return (
        <SectionWrapper>
          <Banner {...ribbon.properties} />
        </SectionWrapper>
      )
    }
    case RibbonType.CoverImage: {
      return (
        <SectionWrapper
          className="h-screen md:h-0"
          onView={() => {
            if (ribbon.type !== RibbonType.CoverImage) return

            onView?.(ribbon.position)
          }}
        >
          <CoverImage {...ribbon.properties} />
        </SectionWrapper>
      )
    }
    case RibbonType.Countdown: {
      return (
        <SectionWrapper>
          <Countdown {...ribbon.properties} />
        </SectionWrapper>
      )
    }
    case RibbonType.ImageCarousel: {
      return (
        <SectionWrapper>
          <ImageCarousel {...ribbon.properties} />
        </SectionWrapper>
      )
    }
    case RibbonType.ImageGallery: {
      return (
        <SectionWrapper>
          <ImageGallery {...ribbon.properties} />
        </SectionWrapper>
      )
    }
    case RibbonType.Location: {
      return (
        <SectionWrapper>
          <Location {...ribbon.properties} />
        </SectionWrapper>
      )
    }
    case RibbonType.Text: {
      return (
        <SectionWrapper className="!h-auto min-h-screen">
          <Text {...ribbon.properties} />
        </SectionWrapper>
      )
    }
    default:
      return null
  }
}
