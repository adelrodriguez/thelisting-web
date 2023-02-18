import { EyeIcon } from "@heroicons/react/20/solid"
import type { Listing } from "@prisma/client"
import { Link } from "@remix-run/react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { ViewOnShopify } from "~/components/admin"
import { Button } from "~/components/common"
import prisma from "~/helpers/prisma.server"
import { json, useLoaderData } from "~/utils/remix"

export async function loader() {
  const listings = await prisma.listing.findMany({
    include: {
      items: {
        select: { id: true },
      },
      owner: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return json({ listings })
}

const columnHelper = createColumnHelper<
  Listing & {
    items: { id: string }[]
    owner: { firstName: string; lastName: string }
  }
>()

const columns = [
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
  columnHelper.accessor("items", {
    cell: (props) => {
      const listing = props.row.original

      return listing.items.length
    },
    header: "No. Items",
  }),
  columnHelper.accessor("owner", {
    cell: (props) => {
      const listing = props.row.original

      return `${listing.owner.firstName} ${listing.owner.lastName}`
    },
    header: "Owner",
  }),
  columnHelper.display({
    cell: (props) => {
      const listing = props.row.original

      if (!listing.commerceId) {
        return null
      }

      return <ViewOnShopify id={listing.commerceId} />
    },
    id: "viewOnShopify",
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

      <div className="mt-8 flex flex-col">
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
                          className="max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap py-3 px-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
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
                          className="max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap px-3 py-4 text-sm text-gray-500"
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
