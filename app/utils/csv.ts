import Papa from "papaparse"

export function downloadAsCSVFile(filename: string, data: unknown[], config?: Papa.UnparseConfig) {
  const csv = Papa.unparse(data, config)
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
