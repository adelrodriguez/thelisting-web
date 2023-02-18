import currency from "currency.js"
import invariant from "tiny-invariant"
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
  scrapedProductId: z.preprocess(undefinedToNull, z.string().nullable()),
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

export const ScrapedProductResultSchema = z.object({
  cached: z.boolean().optional(),
  /** The duration for the function execution (in milliseconds)  */
  duration: z.number(),
  errors: z.array(z.string()),
  fields: ScrapedFieldsSchema,
  id: z.string().uuid(),
  /** The start time the function was executed */
  time: z.number(),
  url: z.string(),
})
export type ScrapedProductResult = z.infer<typeof ScrapedProductResultSchema>

export function parseScrapedProductResult(data: unknown) {
  return ScrapedProductResultSchema.parse(data)
}

export function cleanAmount(amount?: string | null): number {
  invariant(amount, "There was no specified amount for this property")

  const value = currency(amount).value

  invariant(!isNaN(value), `The amount "${amount}" is not a valid number`)

  return value
}

export function cleanText(text?: string | null): string {
  invariant(text, "There was no specified text for this property")

  return text.trim().replaceAll("\n", " ")
}

export async function scrapeProduct(
  url: string,
  init?: RequestInit
): Promise<ScrapedProductResult> {
  const requestUrl = new URL("/api/scraper/product", window.location.origin)
  requestUrl.searchParams.set("url", url)

  const res = await fetch(requestUrl, init)

  const data = await res.json()

  return parseScrapedProductResult(data)
}

export async function scrapeImage(url: string): Promise<Blob> {
  const res = await fetch("/api/scraper/image?" + new URLSearchParams({ url }))

  return res.blob()
}
