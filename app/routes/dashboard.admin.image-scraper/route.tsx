import { DocumentArrowDownIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import { enqueueSnackbar } from "notistack"
import { useDropzone } from "react-dropzone"

import { Button } from "~/components/common"
import { useCSVParser } from "~/utils/hooks"

export const handle = {
  crumb: () => ({
    href: "/dashboard/admin/image-scraper/",
    name: "Image Scraper",
  }),
}

type ImagesToScrape = {
  filename: string
  url: string
}

function transformHeader(_: string, index: number): string {
  const header = ["filename", "url"][index]

  if (!header) {
    enqueueSnackbar(`Column ${index + 1} must be empty`, { variant: "error" })
    return `Column ${index + 1} must be empty`
  }

  return header
}

export default function AdminToolsScrapeImagesPage() {
  const { parse, result } = useCSVParser<ImagesToScrape>({
    header: true,
    transformHeader,
  })
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
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

  async function handleDownloadImages() {
    if (!result || !result.data) return

    for (const image of result.data) {
      const requestUrl = new URL("/api/scraper/image", window.location.origin)
      requestUrl.searchParams.set("url", image.url)

      const res = await fetch(requestUrl)

      const blob = await res.blob()

      const href = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = href
      a.download = image.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:text-center">
        <p className="text-base font-semibold uppercase tracking-wide text-teal-600">Admin Tools</p>
        <h2 className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
          Scrape Images
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 sm:mx-auto">
          Import a CSV file with filenames and URLs to scrape images from, and the results will be
          downloaded to your computer.
        </p>
      </div>
      <div className="mt-8">
        {result?.data ? (
          <>
            <p className="max-w-2xl text-lg text-gray-500 lg:mx-auto">
              You have <span className="font-bold text-black">{result.data.length}</span> images
              available to download
            </p>
            <Button className="mt-4" onClick={handleDownloadImages} size="xl">
              Download
            </Button>
          </>
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
    </div>
  )
}
