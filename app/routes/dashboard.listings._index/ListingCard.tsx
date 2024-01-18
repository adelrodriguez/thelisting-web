import { Menu, Transition } from "@headlessui/react"
import {
  ArrowTopRightOnSquareIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/20/solid"
import { Listing, ListingStatus, User } from "@prisma/client"
import { Link } from "@remix-run/react"
import clsx from "clsx"
import { format } from "date-fns"
import { Fragment } from "react"
import { route } from "routes-gen"

import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import { formatPrice } from "~/utils/money"
import { generateShopifyAdminUrl, getShopifyIdNumber } from "~/utils/shopify"

const statuses = {
  [ListingStatus.Draft]: "text-yellow-700 bg-yellow-50 ring-yellow-600/10",
  [ListingStatus.Published]: "text-green-700 bg-green-50 ring-green-600/20",
  [ListingStatus.Closed]: "text-gray-600 bg-gray-50 ring-gray-500/10",
}

export default function ListingCard({
  commerceId,
  coverImage,
  eventDate,
  id,
  isInternal,
  owner,
  path,
  purchaseTotal,
  sku,
  status,
  title,
}: Pick<
  Listing,
  | "commerceId"
  | "coverImage"
  | "eventDate"
  | "id"
  | "path"
  | "sku"
  | "status"
  | "title"
  | "isInternal"
> & {
  owner: Pick<User, "firstName" | "lastName">
  purchaseTotal: number
}) {
  return (
    <li className="overflow-hidden rounded-xl border border-gray-200">
      <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
        {coverImage ? (
          <img
            alt={title}
            className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
            src={generateCloudflareImageUrl(coverImage, "thumbnail")}
          />
        ) : (
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-500 ring-1 ring-gray-900/10">
            <span className="text-sm font-medium leading-none text-white">
              {title[0]}
            </span>
          </span>
        )}
        <Link className="flex flex-col" to={`${sku}/`}>
          <h3 className="text-sm font-medium leading-6 text-gray-900">
            {title}
          </h3>
          <span className="text-xs text-gray-500">{sku}</span>
        </Link>

        <Menu as="div" className="relative ml-auto">
          <Menu.Button className="-m-2.5 block p-2.5 text-gray-400 hover:text-gray-500">
            <span className="sr-only">Open options</span>
            <EllipsisHorizontalIcon aria-hidden="true" className="h-5 w-5" />
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
                <Link
                  className="block px-3 py-1 text-sm leading-6 text-gray-900 ui-active:bg-gray-50"
                  to={route("/dashboard/listings/:listingSku/details", {
                    listingSku: `${sku}`,
                  })}
                >
                  Details<span className="sr-only">, {title}</span>
                </Link>
              </Menu.Item>

              <Menu.Item>
                <Link
                  className="block px-3 py-1 text-sm leading-6 text-gray-900 ui-active:bg-gray-50"
                  target="_blank"
                  to={route("/:listing", { listing: path })}
                >
                  View <span className="sr-only">{title}</span>
                </Link>
              </Menu.Item>

              <Menu.Item>
                <Link
                  className="block px-3 py-1 text-sm leading-6 text-gray-900 ui-active:bg-gray-50"
                  target="_blank"
                  to={route("/:listing/review", {
                    listing: path,
                  })}
                >
                  Review <span className="sr-only">{title}</span>
                </Link>
              </Menu.Item>

              <Menu.Item>
                <a
                  className="block px-3 py-1 text-sm leading-6 text-gray-900 ui-active:bg-gray-50"
                  href={route("/api/admin/listings/:listingId/report.csv", {
                    listingId: id,
                  })}
                >
                  Download report
                </a>
              </Menu.Item>

              <Menu.Item>
                <Link
                  className="flex items-center px-3 py-1 text-sm leading-6 text-gray-900 ui-active:bg-gray-50"
                  target="_blank"
                  to={
                    commerceId
                      ? generateShopifyAdminUrl(
                          `collections/${getShopifyIdNumber(commerceId)}`,
                        )
                      : "#"
                  }
                >
                  View on Shopify
                  <ArrowTopRightOnSquareIcon className="ml-1 inline-block h-4 w-4" />
                </Link>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Event Date</dt>
          <dd className="text-gray-700">
            <time dateTime={eventDate.toISOString()}>
              {format(eventDate, "MMM d, yyyy")}
            </time>
          </dd>
        </div>
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Purchases</dt>
          <dd className="flex items-start gap-x-2">
            <div className="font-medium text-gray-900">
              {formatPrice(purchaseTotal)}
            </div>
            <div
              className={clsx(
                statuses[status],
                "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
              )}
            >
              {status}
            </div>
            {isInternal && (
              <div className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                Internal
              </div>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Owner</dt>
          <dd className="text-gray-700">
            <time dateTime={eventDate.toISOString()}>
              {owner.firstName} {owner.lastName}
            </time>
          </dd>
        </div>
      </dl>
    </li>
  )
}
