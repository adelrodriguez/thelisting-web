import { DocumentArrowDownIcon } from "@heroicons/react/24/outline"
import { Outlet, useNavigate, useOutletContext } from "@remix-run/react"
import clsx from "clsx"
import { enqueueSnackbar, useSnackbar } from "notistack"
import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"

import { useCSVParser } from "~/utils/hooks"
import type { ScrapeProductsTableRow } from "~/utils/scraper"

import ScrapeProductsTable from "./ScrapeProductsTable"

export const handle = {
  crumb: () => ({
    href: "/dashboard/admin/product-scraper",
    name: "Product Scraper",
  }),
}

export const Headers = [
  "id",
  "url",
  "quantity",
  "title",
  "description",
  "image",
  "amount",
  "currency",
] as const

function transformHeader(_: string, index: number): string {
  const header = Headers[index]

  if (!header) {
    enqueueSnackbar(`Column ${index + 1} must be empty`, { variant: "error" })
    return `Column ${index + 1} must be empty`
  }

  return header
}

export default function AdminToolsProductScraperPage() {
  const { enqueueSnackbar } = useSnackbar()

  const { parse, result } = useCSVParser<ScrapeProductsTableRow>({
    header: true,
    transformHeader,
  })
  const [products, setProducts] = useState<ScrapeProductsTableRow[]>([])
  const navigate = useNavigate()
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    onDrop: (files) => {
      if (!files[0]) {
        enqueueSnackbar("You must provide a file", { variant: "error" })
        return
      }

      parse(files[0])
    },
  })

  // TODO(adelrodriguez): Check the data returned from the parser and show
  // errors if we find duplicated ids or urls

  useEffect(() => {
    if (result && result.data) {
      const ids = new Set()
      const urls = new Map<string, string | number>()

      result.data.forEach((row) => {
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
    }
  }, [result, enqueueSnackbar])

  function handleExport(data: ScrapeProductsTableRow[]) {
    setProducts(data)
    navigate("export-to-csv")
  }

  function handleAddToListing(data: ScrapeProductsTableRow[]) {
    setProducts(data)
    navigate("add-to-listing")
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="lg:text-center">
        <p className="text-base font-semibold uppercase tracking-wide text-teal-600">
          Admin Tools
        </p>
        <h2 className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
          Scrape Products
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
          Import a CSV file with URLs to scrape product from, and export the
          results to a CSV file or to your Shopify store.
        </p>
      </div>
      <div className="mt-8">
        {result ? (
          <ScrapeProductsTable
            data={result.data}
            onAddToListing={handleAddToListing}
            onExport={handleExport}
          />
        ) : (
          <div className="mx-auto w-full max-w-7xl">
            <button
              {...getRootProps({
                className: clsx(
                  "relative block w-full rounded-lg p-6 text-center transition-all hover:border-gray-400  focus:shadow-lg focus:outline-none",
                  {
                    "bg-gray-100 shadow-lg": isDragActive,
                    "border-2 border-dashed border-gray-300": !isDragActive,
                  },
                ),
                type: "button",
              })}
            >
              <div className="flex flex-col space-y-1 text-sm text-gray-600">
                <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mx-auto flex">
                  <label
                    className="relative cursor-pointer rounded-md  font-medium text-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-500 focus-within:ring-offset-2 hover:text-gray-500"
                    htmlFor="file-upload"
                  >
                    Upload a file
                  </label>
                  <input
                    {...getInputProps({
                      className: "sr-only",
                      id: "csv-upload",
                      name: "csv-upload",
                      type: "file",
                    })}
                  />
                  <p className="pl-1">or drag and drop</p>
                </div>

                <p className="text-xs text-gray-500">CSV files up to 10MB</p>
              </div>
            </button>
          </div>
        )}
      </div>
      <Outlet context={{ products }} />
    </div>
  )
}

export function useScrapedProducts() {
  return useOutletContext<{ products: ScrapeProductsTableRow[] }>()
}
