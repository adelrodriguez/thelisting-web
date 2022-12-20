import Papa from "papaparse"
import { useEffect, useState } from "react"

import { FileError } from "~/utils/errors"

export default function useCSVParser<T>({
  header,
  transform,
  transformHeader,
}: {
  header?: boolean
  transform?: (value: string, field: string | number) => string | number
  transformHeader?: (header: string, index: number) => string
}): {
  filename: string | null
  parse: (file: File) => void
  result: Papa.ParseResult<T> | null
} {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<Papa.ParseResult<T> | null>(null)

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
      transform,
      transformHeader,
    })
  }, [file, header, transform, transformHeader])

  return {
    filename: file ? file.name.split(".")[0] : null,
    parse: setFile,
    result,
  }
}
