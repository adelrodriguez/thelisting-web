import { Menu, Transition } from "@headlessui/react"
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid"
import type { Item } from "@prisma/client"
import type { LoaderArgs } from "@remix-run/node"
import { Link } from "@remix-run/react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Fragment } from "react"

import { ViewOnShopify } from "~/components/admin"
import prisma from "~/helpers/prisma.server"
import { useProduct } from "~/utils/hooks"
import { NotFound } from "~/utils/http.server"
import { getParam, json, useLoaderData } from "~/utils/remix"

export async function loader({ params }: LoaderArgs) {
  const sku = getParam(params, "listing")

  if (isNaN(Number(sku))) throw NotFound

  const items = await prisma.item.findMany({
    orderBy: {
      sku: "asc",
    },
    where: {
      listing: {
        sku: Number(sku),
      },
    },
  })

  return json({ items })
}

const columnHelper = createColumnHelper<Item>()

const columns = [
  columnHelper.accessor("sku", {
    header: "SKU",
  }),
  columnHelper.accessor("commerceId", {
    cell: (props) => {
      const item = props.row.original

      return <TitleCell item={item} />
    },
    header: "Title",
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
            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white py-1 px-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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

export default function DashboardListingItemsPage() {
  const { items } = useLoaderData<typeof loader>()
  const table = useReactTable({
    columns,
    data: items,
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
                  <tr key={row.id} className="relative hover:bg-gray-50">
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
  )
}

function TitleCell({ item }: { item: Item }) {
  const { data, isLoading, isError } = useProduct(item.commerceId!)

  if (isLoading) return <div>Loading...</div>

  if (isError) return <div>Error</div>

  return (
    <Link
      to={`./${item.sku}`}
      className="text-gray-600 hover:text-gray-900 hover:underline"
    >
      {data.title}
    </Link>
  )
}
