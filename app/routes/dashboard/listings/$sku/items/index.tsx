import type { Item } from "@prisma/client"
import type { LoaderArgs } from "@remix-run/node"
import { Link } from "@remix-run/react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { ViewOnShopify } from "~/components/dashboard"
import prisma from "~/helpers/prisma.server"
import { NotFound } from "~/utils/http.server"
import { json, useLoaderData } from "~/utils/remix"

export async function loader({ params }: LoaderArgs) {
  const sku = params.sku

  if (!sku) throw NotFound

  if (isNaN(Number(sku))) throw NotFound

  const listing = await prisma.listing.findUnique({
    include: { items: true },
    where: { sku: Number(sku) },
  })

  if (!listing) throw NotFound

  return json(listing)
}

const columnHelper = createColumnHelper<Item>()

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
  }),
  columnHelper.accessor("sku", {
    header: "SKU",
  }),
  columnHelper.accessor("quantity", {
    header: "Quantity",
  }),
  columnHelper.accessor("stock", {
    header: "Stock",
  }),
  columnHelper.display({
    cell: (props) => {
      const item = props.row.original

      return (
        <Link
          to={`./${item.sku}`}
          className="font-medium text-gray-600 hover:text-gray-900"
        >
          Edit
        </Link>
      )
    },
    id: "Edit",
  }),
  columnHelper.display({
    cell: (props) => {
      const item = props.row.original

      if (!item.commerceId) return null

      return <ViewOnShopify id={item.commerceId} />
    },
    id: "View on Shopify",
  }),
]

export default function DashboardListingItemsPage() {
  const listing = useLoaderData<typeof loader>()
  const table = useReactTable({
    columns,
    data: listing.items,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
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
                  <tr key={row.id}>
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
  )
}
