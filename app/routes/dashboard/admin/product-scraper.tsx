import type { ScrapeProductsTableRow } from "~/components/admin"
import { ScrapeProductsTable } from "~/components/admin"
import { Dropzone } from "~/components/file"
import useCSVParser from "~/utils/hooks/use-csv-parser"

function transformHeader(header: string, index: number) {
  if (index === 0) return "id"
  if (index === 1) return "url"
  if (index === 2) return "quantity"

  return header.toLocaleLowerCase()
}

export default function AdminToolsProductScraperPage() {
  const { parse, results } = useCSVParser<ScrapeProductsTableRow>({
    header: true,
    transformHeader,
  })

  if (results) {
    return <ScrapeProductsTable data={results.data} />
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <p className="text-base text-teal-600 font-semibold tracking-wide uppercase">
            Admin Tools
          </p>
          <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Scrape Products
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Import a CSV file with URLs to scrape product from, and export the
            results to a CSV file or to your Shopify store.
          </p>
        </div>
        <div className="mt-8">
          <Dropzone
            fileTypes={{ "text/csv": [".csv"] }}
            onDrop={(files) => parse(files[0])}
          />
        </div>
      </div>
    </div>
  )
}
