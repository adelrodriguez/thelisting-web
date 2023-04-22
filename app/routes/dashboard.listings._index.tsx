import { Menu, Transition } from "@headlessui/react"
import { EllipsisVerticalIcon, EyeIcon } from "@heroicons/react/20/solid"
import { ArrowDownOnSquareIcon } from "@heroicons/react/24/outline"
import type { LoaderArgs, SerializeFrom } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { format, parseISO } from "date-fns"
import { Fragment } from "react"

import { ViewOnShopify } from "~/components/admin"
import { Button } from "~/components/common"
import { formatPrice } from "~/utils/money"
import type { ArrayElement } from "~/utils/type"

export async function loader({ context }: LoaderArgs) {
  const { db } = context

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
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return json({ listings })
}

const columnHelper =
  createColumnHelper<ArrayElement<SerializeFrom<typeof loader>["listings"]>>()

const columns = [
  // For some reason this results in a possible infinite type error
  // @ts-expect-error
  columnHelper.accessor("sku", {
    header: "SKU",
  }),
  columnHelper.accessor("title", {
    cell: (props) => {
      const listing = props.row.original

      return (
        <Link
          to={`/dashboard/listings/${listing.sku}/`}
          className="text-gray-600 hover:text-gray-900 hover:underline"
        >
          {listing.title}
        </Link>
      )
    },
    header: "Title",
  }),
  columnHelper.accessor("path", {
    cell: (props) => {
      const path = props.getValue()

      return (
        <Link
          to={`/${path}`}
          className="group text-gray-600 hover:text-gray-900 hover:underline"
          target="_blank"
        >
          {path}
          <EyeIcon className="ml-1 hidden h-4 w-4 group-hover:inline-block" />
        </Link>
      )
    },
    header: "Path",
  }),
  columnHelper.accessor("status", {
    header: "Status",
  }),
  columnHelper.accessor("eventDate", {
    cell: (props) => {
      const date = props.getValue()

      return format(parseISO(date), "MMM d, yyyy")
    },
    header: "Event Date",
  }),
  columnHelper.accessor("purchases", {
    cell: (props) => {
      const purchases = props.getValue()

      return purchases.length
    },
    header: "No. Purchases",
  }),
  columnHelper.accessor("items", {
    cell: (props) => {
      const items = props.getValue()

      return items.length
    },
    header: "No. Items",
  }),
  columnHelper.accessor("purchases", {
    cell: (props) => {
      const purchases = props.getValue()

      return formatPrice(
        purchases.reduce((acc, purchase) => acc + purchase.total, 0)
      )
    },
    header: "Total Sales",
    id: "totalSales",
  }),
  columnHelper.accessor("purchases", {
    cell: (props) => {
      const purchases = props.getValue()

      return formatPrice(
        purchases.reduce(
          (acc, purchase) => acc + (purchase.total - purchase.cost),
          0
        )
      )
    },
    header: "Total Revenue",
    id: "totalRevenue",
  }),
  columnHelper.accessor("owner", {
    cell: (props) => {
      const listing = props.row.original

      return `${listing.owner.firstName} ${listing.owner.lastName}`
    },
    header: "Owner",
  }),
  columnHelper.accessor("publishedAt", {
    cell: (props) => {
      const date = props.getValue()

      if (!date) return null

      return format(parseISO(date), "MMM d, yyyy")
    },
    header: "Published At",
  }),
  columnHelper.accessor("closedAt", {
    cell: (props) => {
      const date = props.getValue()

      if (!date) return null

      return format(parseISO(date), "MMM d, yyyy")
    },
    header: "Closed At",
  }),
  columnHelper.display({
    cell: (props) => {
      const item = props.row.original

      return (
        <Menu as="div" className="inline-block text-left">
          <Menu.Button>
            <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
            <span className="sr-only">Open options</span>
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
            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 px-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                <a
                  className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 ui-active:bg-gray-500 ui-active:text-white"
                  href={`/api/admin/listings/${item.id}/report.csv`}
                >
                  <ArrowDownOnSquareIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  Download Report
                </a>
              </Menu.Item>

              <div className="w-full border-t border-gray-100" />

              {item.commerceId && (
                <Menu.Item>
                  <div className="px-2 py-2 ">
                    <ViewOnShopify id={item.commerceId} />
                  </div>
                </Menu.Item>
              )}
            </Menu.Items>
          </Transition>
        </Menu>
      )
    },
    id: "options",
  }),
]

export default function DashboardListingsPage() {
  const { listings } = useLoaderData<typeof loader>()
  const table = useReactTable({
    columns,
    data: listings,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Listings</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the listings that have been created. Click on a
            listing to edit it.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link to="/dashboard/listings/new">
            <Button>Create Listing</Button>
          </Link>
        </div>
      </div>

      <div className="relative mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          scope="col"
                          className="max-w-sm overflow-hidden text-ellipsis whitespace-nowrap py-3 px-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                          key={header.id}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {table.getRowModel().rows.map((row) => (
                    <tr className="hover:bg-gray-50" key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td
                          className="max-w-sm overflow-hidden text-ellipsis whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                          key={cell.id}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
