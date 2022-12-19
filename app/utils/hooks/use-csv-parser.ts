import { useEffect, useState } from "react"

import { parseCSVFile } from "~/utils/csv"
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
  results: Papa.ParseResult<T> | null
} {
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<Papa.ParseResult<T> | null>(null)

  useEffect(() => {
    if (!file) return

    parseCSVFile<T>(file, {
      header,
      onComplete: (results) => {
        setResults(results)
      },
      onError: (error) => {
        throw new FileError(error.message, "unable_to_parse_file")
      },
      transform,
      transformHeader,
    })
  }, [file, header, transform, transformHeader])

  return {
    filename: file ? file.name.split(".")[0] : null,
    parse: setFile,
    results,
  }
}
