import Papa from "papaparse"

export function parseCSVFile<T>(
  file: File,
  {
    onComplete,
    onError,
    header,
    transform,
    transformHeader,
  }: {
    onComplete: (results: Papa.ParseResult<T>, file: File) => void
    onError?: (error: Error, file: File) => void
    header?: boolean
    transform?: (value: string, field: string | number) => string | number
    transformHeader?: (header: string, index: number) => string
  }
) {
  Papa.parse<T, File>(file, {
    complete: onComplete,
    dynamicTyping: true,
    error: onError,
    header,
    skipEmptyLines: "greedy",
    transform,
    transformHeader,
  })
}

export function downloadAsCSVFile(filename: string, data: unknown[]) {
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
