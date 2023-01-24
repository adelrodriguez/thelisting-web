import { enqueueSnackbar } from "notistack"
import invariant from "tiny-invariant"

import { Button } from "~/components/common"
import { Dropzone } from "~/components/file"
import { useCSVParser } from "~/utils/hooks"
import { scrapeImage } from "~/utils/scraper"

type ImagesToScrape = {
  filename: string
  url: string
}

const Headers = ["filename", "url"] as const

function transformHeader(_: string, index: number): string {
  const header = Headers[index]

  invariant(header, () => {
    enqueueSnackbar(`Column ${index + 1} must be empty`, { variant: "error" })
    return `Column ${index + 1} must be empty`
  })

  return header
}

export default function AdminToolsScrapeImagesPage() {
  const { parse, result } = useCSVParser<ImagesToScrape>({
    header: true,
    transformHeader,
  })

  async function handleDownloadImages() {
    if (!result || !result.data) return

    for (const image of result.data) {
      const blob = await scrapeImage(image.url)

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
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 lg:text-center">
      <div>
        <p className="text-base text-teal-600 font-semibold tracking-wide uppercase">
          Admin Tools
        </p>
        <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Scrape Images
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
          Import a CSV file with filenames and URLs to scrape images from, and
          the results will be downloaded to your computer.
        </p>
      </div>
      <div className="mt-8">
        {result?.data ? (
          <>
            <p className="max-w-2xl text-lg text-gray-500 lg:mx-auto">
              You have{" "}
              <span className="text-black font-bold">{result.data.length}</span>{" "}
              images available to download
            </p>
            <Button size="xl" onClick={handleDownloadImages} className="mt-4">
              Download
            </Button>
          </>
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
    </div>
  )
}
