import { RibbonType } from "@prisma/client"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { defer } from "@remix-run/node"
import { Await, Link, useLoaderData, useParams } from "@remix-run/react"
import clsx from "clsx"
import { AnimatePresence, motion } from "framer-motion"
import { ReactNode, Suspense, useState } from "react"
import type { RouteParams } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import {
  HOMEPAGE_URL,
  THE_LISTING_LOGO_BLACK,
  THE_LISTING_LOGO_WHITE,
} from "~/config/consts"
import auth from "~/helpers/auth.server"
import { generateGoogleFontsUrl, getFont } from "~/utils/font"
import { notFound, temporaryRedirect, unauthorized } from "~/utils/http"
import { getItemWithData } from "~/utils/item"
import { ListingThemeSchema } from "~/utils/listing"
import { RibbonSchema, getCoverImages, getRibbonFonts } from "~/utils/ribbons"

import Banner from "./Banner"
import Countdown from "./Countdown"
import CoverImage from "./CoverImage"
import Embedded from "./Embedded"
import ImageCarousel from "./ImageCarousel"
import ImageGallery from "./ImageGallery"
import Location from "./Location"
import RegistryShowcase from "./RegistryShowcase"
import SectionWrapper from "./SectionWrapper"
import Text from "./Text"
import useTheme, { ThemeProvider } from "./ThemeProvider"

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const db = context.db
  const cache = context.cache

  const { listingPath } = zx.parseParams(params, { listingPath: z.string() })

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
      path: listingPath,
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

  if (listing.redirectUrl) {
    return temporaryRedirect(listing.redirectUrl)
  }

  if (listing.status === "Draft") {
    const user = await auth.isAuthenticated(request)

    if (!user) {
      throw unauthorized({ message: "You must be logged in to view this page" })
    }
  }

  // Get all the cover images plus their index
  const coverImages = getCoverImages(listing.ribbons)
  const ribbonFonts = getRibbonFonts(listing.ribbons)

  const theme = ListingThemeSchema.parse(listing.theme)
  const [headingFont, bodyFont] = await Promise.all([
    theme.fonts?.heading ? getFont(cache, theme.fonts.heading) : null,
    theme.fonts?.body ? getFont(cache, theme.fonts.body) : null,
  ])
  const fonts = await Promise.all(
    ribbonFonts.map((font) => getFont(cache, font)),
  )

  const items = await db.item.findMany({
    where: { commerceId: { not: null }, listingId: listing.id },
  })

  const itemsPromise = Promise.all(
    items.map((item) => getItemWithData(cache, item)),
  ).then((items) => items.filter(Boolean))

  const fontsUrl = generateGoogleFontsUrl([headingFont, bodyFont, ...fonts])

  return defer({ coverImages, fontsUrl, items: itemsPromise, listing, theme })
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
      {
        script: {
          // async: true,
          url: "https://tally.so/widgets/embed.js",
        },
      },
      ...(data.fontsUrl
        ? [{ href: data.fontsUrl, rel: "stylesheet", tagName: "link" }]
        : []),
    ]
  } catch (error) {
    return []
  }
}

export default function ListingPage() {
  const { coverImages, items, listing, theme } = useLoaderData<typeof loader>()
  const [cover, setCover] = useState(coverImages[0])
  const { listingPath } = useParams<RouteParams["/:listingPath/registry"]>()

  function handleCoverChange(position: number) {
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
        <RibbonsContainer>
          {listing.ribbons.map((ribbon) => {
            const result = RibbonSchema.safeParse(ribbon)

            if (!result.success) {
              // TODO(adelrodriguez): Report to Sentry
              return null
            }

            const props = {
              styles: result.data.styles,
            }

            switch (result.data.type) {
              case RibbonType.Banner: {
                if (!listingPath) return null

                return (
                  <SectionWrapper
                    {...props}
                    className="h-screen"
                    key={ribbon.id}
                  >
                    <Banner {...result.data.properties} path={listingPath} />
                  </SectionWrapper>
                )
              }
              case RibbonType.CoverImage: {
                return (
                  <SectionWrapper
                    {...props}
                    className="h-screen md:h-0"
                    key={ribbon.id}
                    onView={() => {
                      if (ribbon.type !== RibbonType.CoverImage) return

                      handleCoverChange(ribbon.position)
                    }}
                  >
                    <CoverImage {...result.data.properties} />
                  </SectionWrapper>
                )
              }
              case RibbonType.Countdown: {
                return (
                  <SectionWrapper {...props} key={ribbon.id}>
                    <Countdown {...result.data.properties} />
                  </SectionWrapper>
                )
              }
              case RibbonType.Embedded: {
                return (
                  <SectionWrapper {...props} key={ribbon.id}>
                    <Embedded {...result.data.properties} />
                  </SectionWrapper>
                )
              }
              case RibbonType.ImageCarousel: {
                return (
                  <SectionWrapper {...props} key={ribbon.id}>
                    <ImageCarousel {...result.data.properties} />
                  </SectionWrapper>
                )
              }
              case RibbonType.ImageGallery: {
                return (
                  <SectionWrapper {...props} key={ribbon.id}>
                    <ImageGallery {...result.data.properties} />
                  </SectionWrapper>
                )
              }
              case RibbonType.Location: {
                return (
                  <SectionWrapper {...props} key={ribbon.id}>
                    <Location {...result.data.properties} />
                  </SectionWrapper>
                )
              }
              case RibbonType.Text: {
                return (
                  <SectionWrapper {...props} key={ribbon.id}>
                    <Text {...result.data.properties} />
                  </SectionWrapper>
                )
              }
              case RibbonType.RegistryShowcase: {
                if (!listingPath) return null

                return (
                  <Suspense fallback={null} key={ribbon.id}>
                    <Await resolve={items}>
                      {(items) => (
                        <SectionWrapper {...props}>
                          <RegistryShowcase
                            {...result.data.properties}
                            items={items}
                            path={listingPath}
                          />
                        </SectionWrapper>
                      )}
                    </Await>
                  </Suspense>
                )
              }
              default:
                return null
            }
          })}
          <footer className="py-10">
            <Link target="_blank" to={HOMEPAGE_URL}>
              <img
                alt="The Listing"
                className="mx-auto h-10 w-full object-contain"
                loading="eager"
                src={
                  theme.darkLogo
                    ? THE_LISTING_LOGO_BLACK
                    : THE_LISTING_LOGO_WHITE
                }
              />
            </Link>
          </footer>
        </RibbonsContainer>
      </main>
    </ThemeProvider>
  )
}

function RibbonsContainer({ children }: { children: ReactNode }) {
  const { styles } = useTheme()

  return (
    <div
      className="z-10 w-full overflow-hidden shadow-gray-700 md:col-span-2 md:border-l-8"
      style={styles}
    >
      {children}
    </div>
  )
}
