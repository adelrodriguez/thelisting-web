import type { RowSelectionState } from "@tanstack/react-table"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table"
import { useState } from "react"

import { Button, Checkbox, FormattedNumber } from "~/components/common"
import type {
  ScrapedProduct,
  ScraperProductRequest,
} from "~/helpers/scraper.server"

import { Spinner } from "../loading"

export type ScrapeProductsTableRow = ScraperProductRequest &
  ScrapedProduct & { quantity: number }

const columnHelper = createColumnHelper<ScrapeProductsTableRow>()

const columns = [
  columnHelper.display({
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        indeterminate={row.getIsSomeSelected()}
      />
    ),
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        indeterminate={table.getIsSomeRowsSelected()}
      />
    ),
    id: "selected",
  }),
  columnHelper.accessor("id", {
    header: "ID",
  }),
  columnHelper.accessor("url", {
    header: "URL",
  }),
  columnHelper.accessor("quantity", {
    header: "Cantidad",
  }),
  columnHelper.accessor("title", {
    header: "Nombre",
  }),
  columnHelper.accessor("description", {
    header: "Descripción",
  }),
  columnHelper.accessor("image", {
    cell: (props) => {
      const value = props.getValue()

      if (!value) return null

      return (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          {value}
        </a>
      )
    },
    header: "Imagen",
  }),
  columnHelper.accessor("amount", {
    cell: (props) => {
      const value = props.getValue()

      if (!value) return null

      return (
        <FormattedNumber prefix="$" thousands decimals={2}>
          {value}
        </FormattedNumber>
      )
    },
    header: "Precio",
  }),
  columnHelper.accessor("currency", {
    header: "Moneda",
  }),
]

let completed = []
let isIdle = true

export default function ScrapeProductsTable({
  data,
}: {
  data: ScrapeProductsTableRow[]
}) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  })
  const selectedLength = Object.keys(rowSelection).length

  function handleExport() {}
  function handleScrape() {}

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            Scrape Products
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Select products to scrape: {selectedLength} selected
          </p>
        </div>
        <div className="mt-4 flex gap-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button type="button" onClick={handleExport} size="sm">
            Export to Wix CSV
          </Button>

          <Button type="button" onClick={handleScrape} disabled={!isIdle}>
            {isIdle ? (
              "Start Scraping"
            ) : (
              <>
                <Spinner />
                Scraping {completed.length + 1} of {selectedLength}...
              </>
            )}
          </Button>

          {!isIdle && (
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              // onClick={() => scraperService.send("CANCEL")}
            >
              Stop
            </button>
          )}
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
    </div>
  )
}
