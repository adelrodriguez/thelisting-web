import { Outlet, useNavigate, useOutletContext } from "@remix-run/react"
import { enqueueSnackbar } from "notistack"
import { useState } from "react"
import invariant from "tiny-invariant"

import { ScrapeProductsTable } from "~/components/admin"
import { Dropzone } from "~/components/file"
import { useCSVParser } from "~/utils/hooks"
import type { ScrapeProductsTableRow } from "~/utils/scraper"

export const handle = {
  crumb: () => ({
    href: "/dashboard/admin/product-scraper",
    name: "Product Scraper",
  }),
}

const Headers = [
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

  invariant(header, () => {
    enqueueSnackbar(`Column ${index + 1} must be empty`, { variant: "error" })
    return `Column ${index + 1} must be empty`
  })

  return header
}

export default function AdminToolsProductScraperPage() {
  const { parse, result } = useCSVParser<ScrapeProductsTableRow>({
    header: true,
    transformHeader,
  })
  const [products, setProducts] = useState<ScrapeProductsTableRow[]>([])
  const navigate = useNavigate()

  function handleExport(data: ScrapeProductsTableRow[]) {
    setProducts(data)
    navigate("export-to-csv")
  }

  function handleAddToListing(data: ScrapeProductsTableRow[]) {
    setProducts(data)
    navigate("add-to-listing")
  }

  return (
    <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
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
            onExport={handleExport}
            onAddToListing={handleAddToListing}
          />
        ) : (
          <Dropzone
            fileTypes={{ "text/csv": [".csv"] }}
            onDrop={(files) => {
              invariant(files[0], "You must provide a file")

              parse(files[0])
            }}
          />
        )}
      </div>
      <Outlet context={{ products }} />
    </div>
  )
}

export function useScrapedProducts() {
  return useOutletContext<{ products: ScrapeProductsTableRow[] }>()
}
