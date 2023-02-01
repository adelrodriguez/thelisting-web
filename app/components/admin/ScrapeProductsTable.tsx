import type { RowSelectionState } from "@tanstack/react-table"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table"
import { useInterpret, useSelector } from "@xstate/react"
import { useSnackbar } from "notistack"
import { Fragment, useEffect, useState } from "react"

import { Button, Checkbox, FormattedNumber } from "~/components/common"
import { Spinner } from "~/components/loading"
import { isDevelopment } from "~/config/vars"
import { scraperMachine } from "~/helpers/machines"
import { round } from "~/utils/number"
import type { ScrapedFields, ScrapedProductResult } from "~/utils/scraper"

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends unknown> {
    updateData: (value: TData) => void
  }
}

export type ScrapeProductsTableRow = ScrapedFields & {
  id: string
  quantity: number
  url: string
}

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
    header: "Image",
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
    header: "Price",
  }),
  columnHelper.accessor("currency", {
    header: "Currency",
  }),
]

export default function ScrapeProductsTable({
  data: initialData,
  onExport,
}: {
  data: ScrapeProductsTableRow[]
  onExport: (data: ScrapeProductsTableRow[]) => void
}) {
  const [data, setData] = useState<ScrapeProductsTableRow[]>(initialData)
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

  const selected = data.filter((_, index) => rowSelection[index])

  useEffect(() => {
    scraperService.onTransition((_, event) => {
      if (!table.options.meta) return

      if (event.type === "FINISHED") {
        const payload = event.payload
        const dataMap = new Map(data.map((row) => [row.url, row]))
        const product = dataMap.get(payload.url)
        const { fields, duration, errors, cached } = payload

        if (!product) return
        table.options.meta.updateData({ ...product, ...fields })

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
    id: string,
    duration: ScrapedProductResult["duration"],
    errors: ScrapedProductResult["errors"],
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
            <Button type="button" onClick={() => onExport(selected)} size="sm">
              Export to CSV
            </Button>

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
    </>
  )
}
