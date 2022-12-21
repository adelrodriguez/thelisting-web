import { Dialog, Transition } from "@headlessui/react"
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import type { RowSelectionState } from "@tanstack/react-table"
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table"
import { useInterpret, useSelector } from "@xstate/react"
import { Fragment, useEffect, useState } from "react"

import { Button, Checkbox, FormattedNumber, Input } from "~/components/common"
import { Spinner } from "~/components/loading"
import { isDev } from "~/config/vars.server"
import { scraperMachine } from "~/helpers/machines"
import type { ScrapedFields } from "~/types/scraper"
import { downloadAsCSVFile } from "~/utils/csv"

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

export default function ScrapeProductsTable({
  data: initialData,
}: {
  data: ScrapeProductsTableRow[]
}) {
  const [data, setData] = useState<ScrapeProductsTableRow[]>(initialData)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [open, setOpen] = useState(false)
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
  const scraperService = useInterpret(scraperMachine, { devTools: isDev })
  const isIdle = useSelector(scraperService, (state) => state.matches("idle"))
  const completed = useSelector(
    scraperService,
    (state) => state.context.completed
  )
  const selected = data.filter((_, index) => rowSelection[index])

  useEffect(() => {
    scraperService.onTransition((_, event) => {
      if (!table.options.meta) return

      // TODO(adelrodriguez): Add message when each product is finished
      if (event.type === "FINISHED") {
        const payload = event.payload
        const dataMap = new Map(data.map((row) => [row.url, row]))
        const product = dataMap.get(payload.url)

        if (!product) return
        table.options.meta.updateData({
          ...product,
          ...payload.fields,
        })
      }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleExport(filename: string) {
    const rowsToExport = selected.map((row) => ({
      /* eslint-disable sort-keys/sort-keys-fix */
      ID: row.id,
      Nombre: row.title,
      Descripción: row.description,
      URL: row.url,
      Cantidad: row.quantity,
      Imagen: row.image,
      Precio: row.amount,
      Moneda: row.currency,
      /* eslint-enable sort-keys/sort-keys-fix */
    }))

    downloadAsCSVFile(filename, rowsToExport)
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
            <h1 className="text-xl font-semibold text-gray-900">
              Scrape Products
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Select products to scrape: {selected.length} selected
            </p>
          </div>
          <div className="mt-4 flex gap-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button type="button" onClick={() => setOpen(true)} size="sm">
              Export to Wix CSV
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
              // TODO(adelrodriguez): Use a button component instead
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => scraperService.send("CANCEL")}
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
      <FilenameModal
        open={open}
        onClose={() => setOpen(false)}
        onExport={handleExport}
      />
    </>
  )
}

function FilenameModal({
  open,
  onClose,
  onExport,
}: {
  open: boolean
  onClose: () => void
  onExport: (filename: string) => void
}) {
  const [filename, setFilename] = useState("")

  function handleSubmit() {
    onClose()
    onExport(filename)
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <ArrowDownTrayIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="mt-3 sm:mt-5">
                  <Dialog.Title
                    as="h3"
                    className="text-lg text-center font-medium leading-6 text-gray-900"
                  >
                    Export your CSV file
                  </Dialog.Title>
                  <div className="mt-2">
                    <Input
                      name="filename"
                      label="Filename"
                      placeholder="my-csv-file.csv"
                      onChange={(e) => setFilename(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4 sm:mt-5">
                  <Button onClick={handleSubmit} className="w-full">
                    Download
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
