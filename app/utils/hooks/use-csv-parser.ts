import Papa from "papaparse"
import { useEffect, useState } from "react"

import { FileError } from "~/utils/error"

export default function useCSVParser<T>({
  header,
  transform,
  transformHeader,
}: {
  header?: boolean
  transform?: Papa.ParseConfig["transform"]
  transformHeader?: Papa.ParseConfig["transformHeader"]
} = {}): {
  filename: string | null
  parse: (file: File) => void
  reset: () => void
  result: Papa.ParseResult<T> | null
} {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<Papa.ParseResult<T> | null>(null)

  function reset() {
    setFile(null)
    setResult(null)
  }

  useEffect(() => {
    if (!file) return

    Papa.parse<T, File>(file, {
      complete: (results) => {
        setResult(results)
      },
      dynamicTyping: true,
      error: (error) => {
        throw new FileError(error.message, "unable_to_parse_file")
      },
      header,
      skipEmptyLines: "greedy",
      transform: (value, field) => {
        if (transform) {
          return transform(value.trim(), field)
        }

        return value.trim()
      },
      transformHeader,
    })
  }, [file, header, transform, transformHeader])

  const filename = file?.name ?? null

  return {
    filename,
    parse: setFile,
    reset,
    result,
  }
}
