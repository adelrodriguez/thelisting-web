import currency from "currency.js"
import { z } from "zod"

import { CurrencySchema } from "~/utils/money"

function undefinedToNull<T>(value: T | undefined): T | null {
  return value === undefined ? null : value
}

export const ScrapedFieldsSchema = z.object({
  amount: z.preprocess(undefinedToNull, z.coerce.number().nullable()),
  currency: z.preprocess(undefinedToNull, CurrencySchema.nullable()),
  description: z.preprocess(undefinedToNull, z.string().nullable()),
  image: z.preprocess(undefinedToNull, z.string().nullable()),
  store: z.preprocess(undefinedToNull, z.string().nullable()),
  title: z.preprocess(undefinedToNull, z.string().nullable()),
})
export type ScrapedFields = z.infer<typeof ScrapedFieldsSchema>

export const ScrapeProductsTableRowSchema = ScrapedFieldsSchema.extend({
  id: z.union([z.string(), z.number()]),
  quantity: z.coerce.number().min(1),
  url: z.string(),
})
export type ScrapeProductsTableRow = z.infer<
  typeof ScrapeProductsTableRowSchema
>

export function parseScrapeProductsTableRow(data: unknown) {
  return ScrapeProductsTableRowSchema.parse(data)
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
  url: string,
  init?: RequestInit
): Promise<ScrapedProductResult> {
  const res = await fetch(
    "/api/scraper/product?" + new URLSearchParams({ url }),
    init
  )

  return res.json()
}

export async function scrapeImage(url: string): Promise<Blob> {
  const res = await fetch("/api/scraper/image?" + new URLSearchParams({ url }))

  return res.blob()
}
