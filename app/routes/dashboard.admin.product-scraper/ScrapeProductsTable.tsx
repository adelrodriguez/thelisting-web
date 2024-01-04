import { Listbox, Transition } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/20/solid"
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
import { Fragment, useState } from "react"

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

const scrapingModes = [
  {
    description:
      "Scrape products one by one, for sites that block parallel requests (like Amazon)",
    title: "Sequential Scrape",
    value: "sequential",
  },
  {
    description:
      "Scrape products in parallel, useful for sites that don't block multiple requests in a short amount of time",
    title: "Parallel Scrape",
    value: "parallel",
  },
] satisfies Array<{
  description: string
  title: string
  value: "sequential" | "parallel"
}>

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
  const [scrapingMode, setScrapingMode] = useState(scrapingModes[0])
  const [scrapingDelay, setScrapingDelay] = useState<number | undefined>(
    undefined,
  )
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
    delay: scrapingDelay && scrapingDelay * 1000, // Convert to ms
    mode: scrapingMode?.value || "sequential",
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
        enqueueSnackbar(`Fetched product ${row.id} with errors`, {
          description: `In ${round(duration / 1000)}s. Errors: ${errors.join(
            ", ",
          )}`,
          variant: "warning",
        })
      } else {
        enqueueSnackbar(`Fetched product ${row.id} successfully `, {
          description: cached
            ? "Recovered from cache"
            : `In ${round(duration / 1000)}s`,
          variant: "success",
        })
      }
    },
  })

  const selected = data.filter((_, index) => rowSelection[index])
  const showDelayInput = scrapingMode?.value === "sequential" && selected.length

  async function handleScrape() {
    const indexes = Object.keys(rowSelection)
    await scrape(indexes.map((index) => Number(index)))
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-end">
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

            {selected.length ? (
              <Listbox onChange={setScrapingMode} value={scrapingMode}>
                {({ open }) => (
                  <>
                    <Listbox.Label className="sr-only">
                      Scraping Mode
                    </Listbox.Label>
                    <div className="relative">
                      <div className="inline-flex divide-x divide-slate-700 rounded-md shadow-sm">
                        <button
                          className="inline-flex items-center gap-x-1.5 rounded-l-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus:outline-none"
                          disabled={!isIdle}
                          onClick={handleScrape}
                        >
                          {isIdle ? (
                            scrapingMode?.title
                          ) : (
                            <>
                              <Spinner />
                              Scraping {completed.length} of {selected.length}
                              ...
                            </>
                          )}
                        </button>
                        <Listbox.Button className="inline-flex items-center rounded-l-none rounded-r-md bg-slate-600 p-2 hover:bg-slate-700 focus:outline-none">
                          <span className="sr-only">Change scraping mode</span>
                          <ChevronDownIcon
                            aria-hidden="true"
                            className="h-5 w-5 text-white"
                          />
                        </Listbox.Button>
                      </div>

                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        show={open}
                      >
                        <Listbox.Options className="absolute right-0 z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {scrapingModes.map((option) => (
                            <Listbox.Option
                              className="cursor-default select-none p-4 text-sm text-gray-900 ui-active:bg-slate-600 ui-active:text-white"
                              disabled={!isIdle}
                              key={option.title}
                              value={option}
                            >
                              <div className="flex flex-col">
                                <div className="flex justify-between">
                                  <p className="font-normal ui-selected:font-semibold">
                                    {option.title}
                                  </p>
                                  <span className="hidden text-slate-600 ui-selected:block ui-active:text-white">
                                    <CheckIcon
                                      aria-hidden="true"
                                      className="h-5 w-5"
                                    />
                                  </span>
                                </div>
                                <p className="mt-2 text-gray-500 ui-active:text-slate-200">
                                  {option.description}
                                </p>
                              </div>
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            ) : null}

            {!isIdle && (
              <Button onClick={cancel} variant="secondary">
                Stop
              </Button>
            )}

            {showDelayInput ? (
              <div>
                <label className="sr-only" htmlFor="delay">
                  Delay
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    className="block w-24 rounded-md border-0 py-1.5 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6"
                    id="delay"
                    min="0"
                    name="price"
                    onChange={(event) =>
                      setScrapingDelay(Number(event.target.value))
                    }
                    placeholder="0.00"
                    type="number"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">secs</span>
                  </div>
                </div>
              </div>
            ) : null}
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
