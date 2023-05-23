import { CheckIcon } from "@heroicons/react/24/solid"
import { Link, Outlet, useNavigate, useOutletContext } from "@remix-run/react"
import type { RowSelectionState } from "@tanstack/react-table"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table"
import { useInterpret, useSelector } from "@xstate/react"
import { useSnackbar } from "notistack"
import { useEffect, useState } from "react"

import { Button, Checkbox } from "~/components/common"
import { Spinner } from "~/components/loading"
import { isDevelopment } from "~/config/vars"
import { scraperMachine } from "~/helpers/machines"
import { formatPrice } from "~/utils/money"
import { round } from "~/utils/number"
import type {
  ScrapedProductPayload,
  ScrapedProductResult,
  ScrapeProductsTableRow,
} from "~/utils/scraper"

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    updateData: (value: TData) => void
  }
}

const columnHelper = createColumnHelper<ScrapeProductsTableRow>()

const columns = [
  columnHelper.display({
    cell: ({ row }) => {
      const value = row.original.scrapedProductId

      if (!value) return null

      return (
        <CheckIcon
          className="h-5 w-5 text-green-500"
          aria-hidden="true"
          title={value}
        />
      )
    },
    id: "scrapedProductId",
  }),
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
  columnHelper.display({
    cell: ({ row }) => row.index + 1,
    header: "No.",
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
          to={value}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
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
          to={value}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
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
]

export default function Page() {
  const initialData = useOutletContext<ScrapeProductsTableRow[] | undefined>()
  const [data, setData] = useState<ScrapeProductsTableRow[]>(initialData || [])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
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
          })
        )
      },
    },
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  })
  const scraperService = useInterpret(scraperMachine, {
    devTools: isDevelopment,
  })
  const isIdle = useSelector(scraperService, (state) => state.matches("idle"))
  const completed = useSelector(
    scraperService,
    (state) => state.context.completed
  )
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const selected = data.filter((_, index) => rowSelection[index])

  useEffect(() => {
    if (!initialData || !initialData.length) {
      navigate("/dashboard/admin/product-scraper")
      return
    }

    const ids = new Set()
    const urls = new Map<string, string | number>()

    initialData.forEach((row) => {
      if (ids.has(row.id)) {
        enqueueSnackbar("Duplicate ID", {
          autoHideDuration: 15_000,
          description: `Row ${row.id} has a duplicated ID`,
          variant: "error",
        })
      } else {
        ids.add(row.id)
      }

      const rowId = urls.get(row.url)

      if (rowId) {
        enqueueSnackbar("Duplicate URL", {
          autoHideDuration: 15_000,
          description: `Row ${row.id} has a duplicated URL with row ${rowId}`,
          variant: "error",
        })
      } else {
        urls.set(row.url, row.id)
      }
    })
  }, [initialData, navigate])

  useEffect(() => {
    scraperService.onTransition((_, event) => {
      if (!table.options.meta) return

      if (event.type === "FINISHED") {
        const result = event.payload
        const dataMap = new Map(data.map((row) => [row.url, row]))
        const product = dataMap.get(result.payload.url)
        const {
          payload: { fields, duration, errors },
          id,
          cached,
        } = result

        if (!product) return
        table.options.meta.updateData({
          ...product,
          ...fields,
          scrapedProductId: id,
        })

        showResultMessage(product.id, duration, errors, cached)
      }

      if (event.type === "ERROR") {
        enqueueSnackbar("An error occurred while scraping", {
          description: event.payload.message,
          variant: "error",
        })
      }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function showResultMessage(
    id: string | number,
    duration: ScrapedProductPayload["duration"],
    errors: ScrapedProductPayload["errors"],
    cached: ScrapedProductResult["cached"]
  ) {
    if (errors.length) {
      enqueueSnackbar(`Fetched product ${id} with errors`, {
        description: `In ${round(duration / 1000)}s. Errors: ${errors.join(
          ", "
        )}`,
        variant: "warning",
      })
    } else {
      enqueueSnackbar(`Fetched product ${id} successfully `, {
        description: cached
          ? "Recovered from cache"
          : `In ${round(duration / 1000)}s`,
        variant: "success",
      })
    }
  }

  function handleScrape() {
    const rowsToScrape = data
      .filter((_, index) => rowSelection[index])
      .map((row) => row.url)
    scraperService.send({ payload: rowsToScrape, type: "START" })
  }

  function handleExportToCSV() {
    navigate("export-to-csv")
  }

  function handleAddToListing() {
    navigate("add-to-listing")
  }

  if (!initialData || !initialData.length) {
    return null
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
          <div className="mt-4 flex gap-4 sm:mt-0 sm:ml-16 sm:flex-none">
            {selected.length > 0 && (
              <>
                <Button
                  type="button"
                  onClick={() => handleAddToListing()}
                  size="sm"
                >
                  Add To Listing
                </Button>
                <Button
                  type="button"
                  onClick={() => handleExportToCSV()}
                  size="sm"
                >
                  Export to CSV
                </Button>
              </>
            )}

            <Button type="button" onClick={handleScrape} disabled={!isIdle}>
              {isIdle ? (
                "Start Scraping"
              ) : (
                <>
                  <Spinner />
                  Scraping {completed.length + 1} of {selected.length}...
                </>
              )}
            </Button>

            {!isIdle && (
              <Button
                variant="secondary"
                onClick={() => scraperService.send("CANCEL")}
              >
                Stop
              </Button>
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
      <Outlet context={selected} />
    </>
  )
}
