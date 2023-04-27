import { Menu, Transition } from "@headlessui/react"
import {
  ArrowTopRightOnSquareIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/20/solid"
import { ListingStatus } from "@prisma/client"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData, useNavigate } from "@remix-run/react"
import clsx from "clsx"
import { format, parseISO } from "date-fns"
import { Fragment } from "react"
import { zx } from "zodix"

import { Button } from "~/components/common"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import { ListingStatusSchema } from "~/utils/listing"
import { formatPrice } from "~/utils/money"
import { getShopifyIdNumber } from "~/utils/shopify"

const tabs = [
  { label: "All", value: undefined },
  { label: ListingStatus.Draft, value: ListingStatus.Draft },
  {
    label: ListingStatus.Published,
    value: ListingStatus.Published,
  },
  { label: ListingStatus.Closed, value: ListingStatus.Closed },
]

const statuses = {
  [ListingStatus.Draft]: "text-yellow-700 bg-yellow-50 ring-yellow-600/10",
  [ListingStatus.Published]: "text-green-700 bg-green-50 ring-green-600/20",
  [ListingStatus.Closed]: "text-gray-600 bg-gray-50 ring-gray-500/10",
}

export async function loader({ context, request }: LoaderArgs) {
  const { db } = context
  const { status } = zx.parseQuery(request, {
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
      },
    },
    orderBy: { eventDate: "asc" },
    take: 100,
    where: { status },
  })

  return json({ listings, status })
}

export default function DashboardListingPage() {
  const { listings, status } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <>
      <div className="flex justify-between sm:hidden">
        <div>
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            defaultValue={status}
            onChange={(event) => {
              navigate(event.target.value)
            }}
          >
            {tabs.map((tab) => (
              <option
                key={tab.label}
                value={tab.value ? `?status=${tab.value}` : "#"}
              >
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        <Link to="/dashboard/listings/new">
          <Button>Create Listing</Button>
        </Link>
      </div>
      <div className="hidden sm:flex sm:justify-between">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.value ? `?status=${tab.value}` : "#"}
              relative="route"
              className={clsx("rounded-md px-3 py-2 text-sm font-medium", {
                "bg-gray-200 text-gray-800": tab.value === status,
                "text-gray-500 hover:text-gray-800": tab.value !== status,
              })}
              aria-current={false}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <Link to="/dashboard/listings/new">
          <Button>Create Listing</Button>
        </Link>
      </div>
      <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
        {listings.map((listing) => (
          <li
            key={listing.id}
            className="overflow-hidden rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
              {listing.coverImage ? (
                <img
                  src={generateCloudflareImageUrl(
                    listing.coverImage,
                    "thumbnail"
                  )}
                  alt={listing.title}
                  className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
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
                    className="h-5 w-5"
                    aria-hidden="true"
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
                          to={`${listing.sku}/edit`}
                          className={clsx(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          Edit<span className="sr-only">, {listing.title}</span>
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to={`/${listing.path}`}
                          target="_blank"
                          className={clsx(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          View<span className="sr-only">, {listing.title}</span>
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to={`/${listing.path}/review`}
                          target="_blank"
                          className={clsx(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          Review
                          <span className="sr-only">, {listing.title}</span>
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href={`/api/admin/listings/${listing.id}/report.csv`}
                          className={clsx(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          Download report
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to={`https://admin.shopify.com/store/${
                            window.env.shopifyStore
                          }/Collections/${getShopifyIdNumber(
                            listing.commerceId!
                          )}`}
                          className={clsx(
                            active ? "bg-gray-50" : "",
                            "flex items-center px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                          target="_blank"
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
                        0
                      )
                    )}
                  </div>
                  <div
                    className={clsx(
                      statuses[listing.status],
                      "rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset"
                    )}
                  >
                    {listing.status}
                  </div>
                  {listing.isInternal && (
                    <div className="rounded-md bg-blue-50 py-1 px-2 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
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
