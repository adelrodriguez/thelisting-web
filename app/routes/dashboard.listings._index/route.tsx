import { MagnifyingGlassIcon } from "@heroicons/react/20/solid"
import { ListingStatus } from "@prisma/client"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import clsx from "clsx"
import { parseISO } from "date-fns"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import { Button } from "~/components/common"
import { useDebouncedSearchParam } from "~/utils/hooks"
import { ListingStatusSchema } from "~/utils/listing"
import { isNumber } from "~/utils/number"

import ListingCard from "./ListingCard"

const tabs = [
  { label: "All", value: "" },
  {
    label: ListingStatus.Published,
    value: ListingStatus.Published,
  },
  { label: ListingStatus.Draft, value: ListingStatus.Draft },
  { label: ListingStatus.Closed, value: ListingStatus.Closed },
]

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { db } = context
  const { status, q } = zx.parseQuery(request, {
    q: z.string().optional(),
    status: ListingStatusSchema.optional(),
  })

  const listings = await db.listing.findMany({
    include: {
      owner: {
        select: { firstName: true, lastName: true },
      },
      purchases: {
        select: { total: true },
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
          <ListingCard
            commerceId={listing.commerceId}
            coverImage={listing.coverImage}
            eventDate={parseISO(listing.eventDate)}
            id={listing.id}
            isInternal={listing.isInternal}
            key={listing.id}
            owner={listing.owner}
            path={listing.path}
            purchaseTotal={listing.purchases.reduce(
              (acc, purchase) => acc + purchase.total,
              0,
            )}
            sku={listing.sku}
            status={listing.status}
            title={listing.title}
          />
        ))}
      </ul>
    </>
  )
}
