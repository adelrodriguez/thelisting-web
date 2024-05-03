import { Bars3Icon } from "@heroicons/react/24/solid"
import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { defer } from "@remix-run/node"
import { Await, Outlet, useLoaderData } from "@remix-run/react"
import * as Sentry from "@sentry/remix"
import clsx from "clsx"
import { cacheHeader } from "pretty-cache-header"
import { Suspense, useState } from "react"
import { z } from "zod"
import { zx } from "zodix"

import { THE_LISTING_LOGO_BLACK } from "~/config/consts"
import { CartProvider } from "~/utils/hooks"
import { notFound } from "~/utils/http"
import { getItemWithData, sortByQuantity } from "~/utils/item"

import Menu from "./Menu"
import Registry from "./Registry"
import RegistryItem from "./RegistryItem"
import RegistryItemSkeleton from "./RegistryItemSkeleton"

export async function loader({ context, params }: LoaderFunctionArgs) {
  const db = context.db
  const cache = context.cache

  const { listingPath } = zx.parseParams(params, { listingPath: z.string() })

  const listing = await db.listing.findFirst({
    where: { path: listingPath, status: "Published" },
  })

  if (!listing) {
    Sentry.captureMessage(`Listing not found: ${listingPath}`)
    throw notFound({
      message: "Sorry, we couldn’t find the page you’re looking for.",
    })
  }

  const items = db.item
    .findMany({
      where: { commerceId: { not: null }, listingId: listing.id },
    })
    .then((_items) =>
      Promise.all(_items.map(async (item) => getItemWithData(cache, item)))
        .then((_items) => _items.filter(Boolean))
        // TODO(adelrodriguez): Sort by filter
        .then((_items) => _items.sort(sortByQuantity)),
    )

  return defer({ items, listing })
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": cacheHeader({
    maxAge: "5min",
    public: true,
  }),
})

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [{ title: "The Listing" }]

  return [
    { title: `${data.listing.title} | The Listing` },
    { content: data.listing.subtitle, name: "description" },
    { content: data.listing.subtitle, name: "og:description" },
    { charSet: "utf-8" },
    {
      content: data.listing.coverImage ?? "", // TODO(adelrodriguez): Add default image
      name: "og:image",
    },
    { content: `${data.listing.title} | The Listing`, name: "og:title" },
    { content: "width=device-width, initial-scale=1", name: "viewport" },
  ]
}

export default function ListingPage() {
  const { items, listing } = useLoaderData<typeof loader>()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <CartProvider listing={listing}>
      <main className="relative min-w-64">
        <div className="sticky top-0 z-20 h-auto w-full bg-white p-3 drop-shadow-md lg:p-4">
          <img
            alt="The Listing"
            className="mx-auto h-10 w-full object-contain lg:h-12"
            loading="eager"
            src={THE_LISTING_LOGO_BLACK}
          />
          <div className="absolute right-0 top-0 flex h-16 w-16 items-center justify-center p-3 lg:h-20 lg:p-4">
            <button className="" onClick={() => setMenuOpen(true)} type="button">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
        </div>
        <Menu close={() => setMenuOpen(false)} open={menuOpen} />
        <section>
          <div className="relative bg-gray-800">
            <div className="absolute inset-0">
              {listing.coverImage && (
                <img
                  alt=""
                  className="h-full w-full object-cover object-center"
                  src={listing.coverImage}
                />
              )}

              <div
                aria-hidden="true"
                className={clsx("absolute inset-0 bg-gray-500", {
                  "mix-blend-multiply": !!listing.coverImage,
                })}
              />
            </div>
            <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24 lg:px-8 lg:py-32">
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

        <section className="mx-4 py-16 sm:mx-12 xl:px-32 2xl:px-64">
          <Suspense
            fallback={
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-8 xl:grid-cols-4 xl:gap-x-10">
                <RegistryItemSkeleton />
                <RegistryItemSkeleton />
                <RegistryItemSkeleton />
                <RegistryItemSkeleton />
              </div>
            }
          >
            <Await resolve={items}>
              {(items) => (
                <Registry>
                  {items.map((item) => (
                    <RegistryItem
                      imageUrl={item.data.imageUrl}
                      key={item.id}
                      price={item.data.price}
                      sku={item.sku}
                      stock={item.stock}
                      title={item.data.title}
                    />
                  ))}
                </Registry>
              )}
            </Await>
          </Suspense>
        </section>
        <Outlet context={listing} />
      </main>
    </CartProvider>
  )
}
