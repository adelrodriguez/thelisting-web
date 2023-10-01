import { Menu, Transition } from "@headlessui/react"
import {
  ArrowTopRightOnSquareIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid"
import { ListingStatus } from "@prisma/client"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import clsx from "clsx"
import { format, parseISO } from "date-fns"
import { Fragment } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import { Button } from "~/components/common"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import { useDebouncedSearchParam } from "~/utils/hooks"
import { ListingStatusSchema } from "~/utils/listing"
import { formatPrice } from "~/utils/money"
import { isNumber } from "~/utils/number"
import { getShopifyIdNumber } from "~/utils/shopify"

const tabs = [
  { label: "All", value: "" },
  {
    label: ListingStatus.Published,
    value: ListingStatus.Published,
  },
  { label: ListingStatus.Draft, value: ListingStatus.Draft },
  { label: ListingStatus.Closed, value: ListingStatus.Closed },
]

const statuses = {
  [ListingStatus.Draft]: "text-yellow-700 bg-yellow-50 ring-yellow-600/10",
  [ListingStatus.Published]: "text-green-700 bg-green-50 ring-green-600/20",
  [ListingStatus.Closed]: "text-gray-600 bg-gray-50 ring-gray-500/10",
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { db } = context
  const { status, q } = zx.parseQuery(request, {
    q: z.string().optional(),
    status: ListingStatusSchema.optional(),
  })

  const listings = await db.listing.findMany({
    include: {
      items: {
        select: { id: true },
      },
      owner: {
        select: { firstName: true, lastName: true },
      },
      purchases: {
        select: { cost: true, id: true, total: true },
        where: { paid: true },
      },
    },
    orderBy: { eventDate: "asc" },
    take: 100,
    where: {
      ...(isNumber(q)
        ? { sku: { equals: Number(q) } }
        : { title: { contains: q, mode: "insensitive" } }),
      status,
    },
  })

  return json({ listings })
}

export default function DashboardListingPage() {
  const { listings } = useLoaderData<typeof loader>()
  const [query, setQuery] = useDebouncedSearchParam("q", 500)
  const [status, setStatus] = useDebouncedSearchParam("status")

  return (
    <>
      <div className="flex items-center justify-between gap-x-2 sm:hidden">
        <div>
          <label className="sr-only" htmlFor="tabs">
            Select a tab
          </label>
          <select
            className="block w-full rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            defaultValue={status}
            id="tabs"
            name="tabs"
            onChange={(event) => setStatus(event.target.value)}
          >
            {tabs.map((tab) => (
              <option key={tab.label} value={tab.value}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="h-5 w-5 text-slate-400"
              />
            </div>
            <input
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6"
              defaultValue={query}
              id="title"
              name="title"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a listing by title or SKU"
              type="text"
            />
          </div>{" "}
        </div>

        <Link to={route("/dashboard/listings/new")}>
          <Button>Create Listing</Button>
        </Link>
      </div>
      <div className="hidden gap-x-8 sm:flex sm:justify-between">
        <nav aria-label="Tabs" className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              aria-current={tab.value === status}
              className={clsx("rounded-md px-3 py-2 text-sm font-medium", {
                "bg-slate-200 text-slate-800": tab.value === status,
                "text-slate-500 hover:text-slate-800": tab.value !== status,
              })}
              key={tab.label}
              onClick={() => setStatus(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="h-5 w-5 text-slate-400"
              />
            </div>
            <input
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6"
              defaultValue={query}
              id="title"
              name="title"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a listing by title or SKU"
              type="text"
            />
          </div>
        </div>

        <Link to={route("/dashboard/listings/new")}>
          <Button>Create Listing</Button>
        </Link>
      </div>
      <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
        {listings.map((listing) => (
          <li
            className="overflow-hidden rounded-xl border border-gray-200"
            key={listing.id}
          >
            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
              {listing.coverImage ? (
                <img
                  alt={listing.title}
                  className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
                  src={generateCloudflareImageUrl(
                    listing.coverImage,
                    "thumbnail",
                  )}
                />
              ) : (
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-500 ring-1 ring-gray-900/10">
                  <span className="text-sm font-medium leading-none text-white">
                    {listing.title[0]}
                  </span>
                </span>
              )}
              <Link className="flex flex-col" to={`${listing.sku}/`}>
                <h3 className="text-sm font-medium leading-6 text-gray-900">
                  {listing.title}
                </h3>
                <span className="text-xs text-gray-500">{listing.sku}</span>
              </Link>

              <Menu as="div" className="relative ml-auto">
                <Menu.Button className="-m-2.5 block p-2.5 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Open options</span>
                  <EllipsisHorizontalIcon
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-0.5 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          className={clsx(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900",
                          )}
                          to={`${listing.sku}/edit`}
                        >
                          Edit<span className="sr-only">, {listing.title}</span>
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          className={clsx(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900",
                          )}
                          target="_blank"
                          to={`/${listing.path}`}
                        >
                          View<span className="sr-only">, {listing.title}</span>
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          className={clsx(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900",
                          )}
                          target="_blank"
                          to={`/${listing.path}/review`}
                        >
                          Review
                          <span className="sr-only">, {listing.title}</span>
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <a
                          className={clsx(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900",
                          )}
                          href={`/api/admin/listings/${listing.id}/report.csv`}
                        >
                          Download report
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          className={clsx(
                            active ? "bg-gray-50" : "",
                            "flex items-center px-3 py-1 text-sm leading-6 text-gray-900",
                          )}
                          target="_blank"
                          to={
                            listing.commerceId
                              ? `https://admin.shopify.com/store/${
                                  window.env.shopifyStore
                                }/Collections/${getShopifyIdNumber(
                                  listing.commerceId,
                                )}`
                              : "#"
                          }
                        >
                          View on Shopify
                          <ArrowTopRightOnSquareIcon className="ml-1 inline-block h-4 w-4" />
                        </Link>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Event Date</dt>
                <dd className="text-gray-700">
                  <time dateTime={listing.eventDate}>
                    {format(parseISO(listing.eventDate), "MMM d, yyyy")}
                  </time>
                </dd>
              </div>
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Purchases</dt>
                <dd className="flex items-start gap-x-2">
                  <div className="font-medium text-gray-900">
                    {formatPrice(
                      listing.purchases.reduce(
                        (acc, purchase) => acc + purchase.total,
                        0,
                      ),
                    )}
                  </div>
                  <div
                    className={clsx(
                      statuses[listing.status],
                      "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                    )}
                  >
                    {listing.status}
                  </div>
                  {listing.isInternal && (
                    <div className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                      Internal
                    </div>
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Owner</dt>
                <dd className="text-gray-700">
                  <time dateTime={listing.eventDate}>
                    {listing.owner.firstName} {listing.owner.lastName}
                  </time>
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}
