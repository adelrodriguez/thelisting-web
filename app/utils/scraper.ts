import currency from "currency.js"

export type ScrapedFields = {
  title: string | null
  store: string | null
  description: string | null
  image: string | null
  amount: number | null
  currency: string | null
}

export type ScrapedProductResult = {
  url: string

  /** The start time the function was executed */
  time: number
  /** The duration for the function execution (in milliseconds)  */
  duration: number
  fields: ScrapedFields
  errors: string[]
  cached?: true
}

export function cleanAmount(amount?: string | null): number {
  if (!amount) {
    throw new Error("There was no specified amount for this property")
  }

  const value = currency(amount).value

  if (isNaN(value)) {
    throw new Error(`The amount "${amount}" is not a valid number`)
  }

  return value
}

export function cleanText(text?: string | null): string {
  if (!text) {
    throw new Error("There was no specified text for this property")
  }

  return text.trim().replaceAll("\n", " ")
}

export async function scrapeProduct(
  url: string
): Promise<ScrapedProductResult> {
  const res = await fetch(
    "/api/scraper/product?" + new URLSearchParams({ url })
  )

  return res.json()
}

export async function scrapeImage(url: string): Promise<Blob> {
  const res = await fetch("/api/scraper/image?" + new URLSearchParams({ url }))

  return res.blob()
}
