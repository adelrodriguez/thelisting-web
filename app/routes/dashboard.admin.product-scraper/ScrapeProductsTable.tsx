import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid"
import { Link } from "@remix-run/react"
import type { RowSelectionState } from "@tanstack/react-table"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table"
import { useSnackbar } from "notistack"
import { useState } from "react"

import { Button, Checkbox } from "~/components/common"
import { Spinner } from "~/components/loading"
import { useScrapeProducts } from "~/utils/hooks"
import { formatPrice } from "~/utils/money"
import { round } from "~/utils/number"
import { ScrapedFields, type ScrapeProductsTableRow } from "~/utils/scraper"

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    updateData: (value: TData) => void
  }
}

const columnHelper = createColumnHelper<ScrapeProductsTableRow>()

const columns = [
  columnHelper.display({
    cell: ({ row }) => {
      const { hasError } = row.original

      if (hasError === undefined) return null

      if (hasError) {
        return (
          <XMarkIcon
            aria-hidden="true"
            className="h-5 w-5 text-red-500"
            title={`Error scraping row ${row.id}`}
          />
        )
      }

      return (
        <CheckIcon
          aria-hidden="true"
          className="h-5 w-5 text-green-500"
          title={`Scraped row ${row.id} successfully`}
        />
      )
    },
    id: "status",
  }),
  columnHelper.display({
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        indeterminate={row.getIsSomeSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    id: "selected",
  }),
  columnHelper.accessor("id", {
    header: "ID",
  }),
  columnHelper.accessor("url", {
    cell: (props) => {
      const value = props.getValue()

      if (!value) return null

      return (
        <Link
          className="hover:underline"
          rel="noreferrer"
          target="_blank"
          to={value}
        >
          {value}
        </Link>
      )
    },
    header: "URL",
  }),
  columnHelper.accessor("quantity", {
    header: "Quantity",
  }),
  columnHelper.accessor("title", {
    header: "Name",
  }),
  columnHelper.accessor("description", {
    header: "Description",
  }),
  columnHelper.accessor("image", {
    cell: (props) => {
      const value = props.getValue()

      if (!value) return null

      return (
        <Link
          className="hover:underline"
          rel="noreferrer"
          target="_blank"
          to={value}
        >
          {value}
        </Link>
      )
    },
    header: "Image",
  }),
  columnHelper.accessor("amount", {
    cell: (props) => {
      const value = props.getValue()

      if (!value) return null

      return formatPrice(value)
    },
    header: "Price",
  }),
  columnHelper.accessor("currency", {
    header: "Currency",
  }),
  columnHelper.accessor("store", {
    header: "Store",
  }),
]

export default function ScrapeProductsTable({
  data: initialData,
  onExport,
  onAddToListing,
}: {
  data: ScrapeProductsTableRow[]
  onExport: (data: ScrapeProductsTableRow[]) => void
  onAddToListing: (data: ScrapeProductsTableRow[]) => void
}) {
  const [data, setData] = useState<ScrapeProductsTableRow[]>(initialData)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const { enqueueSnackbar } = useSnackbar()

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (value) => {
        setData((rows) =>
          rows.map((row) => {
            if (row.id === value.id) {
              return {
                ...row,
                ...value,
              }
            }
            return row
          }),
        )
      },
    },
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  })

  const { scrape, completed, isIdle, cancel } = useScrapeProducts({
    data: initialData,
    onSuccess: (payload, index) => {
      const { fields, duration, errors, cached } = payload
      const row = data[index]

      if (!row) throw new Error("Row not found")

      const hasError = errors.length > 0
      const filteredFields = Object.keys(fields)
        .filter((key) => !errors.includes(key))
        .reduce((obj, key) => {
          // @ts-expect-error Key is a string, should be part of ScrapedFields
          obj[key] = fields[key]
          return obj
        }, {} as Partial<ScrapedFields>)

      table.options.meta?.updateData({
        ...row,
        ...filteredFields,
        hasError,
      })

      if (hasError) {
        enqueueSnackbar(`Fetched product ${index} with errors`, {
          description: `In ${round(duration / 1000)}s. Errors: ${errors.join(
            ", ",
          )}`,
          variant: "warning",
        })
      } else {
        enqueueSnackbar(`Fetched product ${row} successfully `, {
          description: cached
            ? "Recovered from cache"
            : `In ${round(duration / 1000)}s`,
          variant: "success",
        })
      }
    },
    // TODO(adelrodriguez): Make this configurable
    order: "sequential",
  })

  const selected = data.filter((_, index) => rowSelection[index])

  async function handleScrape() {
    const indexes = Object.keys(rowSelection)
    await scrape(indexes.map((index) => Number(index)))
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-lg text-gray-700">
              Products to scrape:{" "}
              <span className="font-bold">{selected.length}</span> selected
            </h3>
          </div>
          <div className="mt-4 flex gap-4 sm:ml-16 sm:mt-0 sm:flex-none">
            {selected.length > 0 && (
              <>
                <Button
                  onClick={() => onAddToListing(selected)}
                  size="sm"
                  type="button"
                >
                  Add To Listing
                </Button>
                <Button
                  onClick={() => onExport(selected)}
                  size="sm"
                  type="button"
                >
                  Export to CSV
                </Button>
              </>
            )}

            <Button onClick={handleScrape} type="button">
              {isIdle ? (
                "Scrape Products"
              ) : (
                <>
                  <Spinner />
                  Scraping {completed.length} of {selected.length}...
                </>
              )}
            </Button>

            {!isIdle && (
              <Button onClick={cancel} variant="secondary">
                Stop
              </Button>
            )}
          </div>
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            className="max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
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
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            className="max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap px-3 py-4 text-sm text-gray-500"
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
      </div>
    </>
  )
}
