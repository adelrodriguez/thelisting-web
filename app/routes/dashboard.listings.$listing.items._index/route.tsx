import { Menu, Transition } from "@headlessui/react"
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid"
import type { Item } from "@prisma/client"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Fragment } from "react"
import { z } from "zod"
import { zx } from "zodix"

import { ViewOnShopify } from "~/components/admin"
import { Button } from "~/components/common"
import { useProduct } from "~/utils/hooks"

export async function loader({ params, context }: LoaderArgs) {
  const { db } = context
  const { listing: sku } = zx.parseParams(params, {
    listing: z.coerce.number(),
  })

  const items = await db.item.findMany({
    orderBy: { sku: "asc" },
    where: { listing: { sku } },
  })

  return json({ items })
}

const columnHelper =
  createColumnHelper<Pick<Item, "sku" | "commerceId" | "quantity" | "stock">>()

const columns = [
  columnHelper.accessor("sku", {
    header: "SKU",
  }),
  columnHelper.accessor("commerceId", {
    cell: (props) => {
      const item = props.row.original

      return <TitleCell commerceId={item.commerceId} sku={item.sku} />
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
    <>
      <div className=" mt-4 sm:flex sm:w-full sm:justify-end">
        <Link to="./new">
          <Button>Add item</Button>
        </Link>
      </div>
      <div className="relative mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className=" min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          className="max-w-sm overflow-hidden text-ellipsis whitespace-nowrap py-3 px-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                          key={header.id}
                          scope="col"
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
                    <tr className=" hover:bg-gray-50" key={row.id}>
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

function TitleCell({
  sku,
  commerceId,
}: {
  sku: Item["sku"]
  commerceId: Item["commerceId"]
}) {
  const { data, isLoading, isError } = useProduct(commerceId!)

  if (isLoading) return <div>Loading...</div>

  if (isError) return <div>Error</div>

  return (
    <Link
      className="text-gray-600 hover:text-gray-900 hover:underline"
      to={`./${sku}`}
    >
      {data.title}
    </Link>
  )
}
