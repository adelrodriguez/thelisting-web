import { Menu, Transition } from "@headlessui/react"
import {
  ArrowTopRightOnSquareIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/20/solid"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import type { Item } from "@prisma/client"
import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import clsx from "clsx"
import { Fragment } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import { Button } from "~/components/common"
import { useProduct } from "~/utils/hooks"
import { RouteHandle } from "~/utils/remix"
import { getShopifyIdNumber } from "~/utils/shopify"
import { ArrayElement } from "~/utils/type"

export const handle: RouteHandle<{ listingSku: string }> = {
  crumb: ({ params }) => ({
    href: route("/dashboard/listings/:listingSku/items", {
      listingSku: params.listingSku,
    }),
    name: "Items List",
  }),
  id: "dashboard-listings-listing-items-index",
}

export async function loader({ context, params }: LoaderFunctionArgs) {
  const { db } = context
  const { listingSku } = zx.parseParams(params, {
    listingSku: z.coerce.number(),
  })

  const items = await db.item.findMany({
    include: {
      listing: {
        select: {
          sku: true,
        },
      },
    },
    orderBy: { sku: "asc" },
    where: { listing: { sku: listingSku } },
  })

  return json({ items })
}

const columnHelper =
  createColumnHelper<ArrayElement<SerializeFrom<typeof loader>["items"]>>()

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
            <Menu.Items className="absolute right-0 z-10 mt-0.5 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
              {item.commerceId && (
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      className={clsx(
                        active ? "bg-gray-50" : "",
                        "flex items-center px-3 py-1 text-sm leading-6 text-gray-900",
                      )}
                      target="_blank"
                      to={
                        item.commerceId
                          ? `https://admin.shopify.com/store/${
                              window.env.shopifyStore
                            }/products/${getShopifyIdNumber(item.commerceId)}`
                          : "#"
                      }
                    >
                      View on Shopify
                      <ArrowTopRightOnSquareIcon className="ml-1 inline-block h-4 w-4" />
                    </Link>
                  )}
                </Menu.Item>
              )}
              <Menu.Item>
                {({ active }) => (
                  <Link
                    className={clsx(
                      active ? "bg-red-50" : "",
                      "block px-3 py-1 text-sm leading-6 text-red-500",
                    )}
                    to={route(
                      "/dashboard/listings/:listingSku/items/:itemSku/delete",
                      {
                        itemSku: item.sku,
                        listingSku: `${item.listing.sku}`,
                      },
                    )}
                  >
                    Delete
                  </Link>
                )}
              </Menu.Item>
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
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className=" min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          className="max-w-sm overflow-hidden text-ellipsis whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                          key={header.id}
                          scope="col"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                            cell.getContext(),
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
  commerceId,
  sku,
}: {
  sku: Item["sku"]
  commerceId: Item["commerceId"]
}) {
  const { data, isError, isPending } = useProduct(commerceId ?? "")

  if (isPending) return <div>Loading...</div>

  if (isError) {
    // TODO(adelrodriguez): add route()
    return (
      <Link
        className="text-red-500 decoration-red-700 hover:text-red-700 hover:underline"
        to={`./${sku}`}
      >
        <div className="flex gap-x-2">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>Error</span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      className="text-gray-600 hover:text-gray-900 hover:underline"
      to={`./${sku}`}
    >
      {data.title}
    </Link>
  )
}
