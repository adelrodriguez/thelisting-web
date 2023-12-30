import currency from "currency.js"
import { z } from "zod"

import type { Currency } from "~/config/consts"
import { CurrencySchema } from "~/utils/money"
import { undefinedToNull } from "~/utils/undefined"

export const ScrapedFields = z.object({
  amount: z.preprocess(undefinedToNull, z.coerce.number().nullable()),
  currency: z.preprocess(undefinedToNull, CurrencySchema.nullable()),
  description: z.preprocess(undefinedToNull, z.string().nullable()),
  image: z.preprocess(undefinedToNull, z.string().nullable()),
  store: z.preprocess(undefinedToNull, z.string().nullable()),
  title: z.preprocess(undefinedToNull, z.string().nullable()),
})
export type ScrapedFields = z.infer<typeof ScrapedFields>

export const ScrapeProductsTableRow = ScrapedFields.extend({
  hasError: z.boolean().optional(),
  id: z.union([z.string(), z.number()]),
  quantity: z.coerce.number().min(1),
  url: z.string(),
})
export type ScrapeProductsTableRow = z.infer<typeof ScrapeProductsTableRow>

export const ScrapedProduct = z.object({
  cached: z.boolean().optional(),
  /** The duration for the function execution (in milliseconds)  */
  duration: z.number(),
  errors: z.array(z.string()),
  fields: ScrapedFields,
  /** The start time the function was executed */
  time: z.number(),
  url: z.string(),
})
export type ScrapedProduct = z.infer<typeof ScrapedProduct>

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

export function cleanCurrency(currency?: string | null): Currency {
  if (!currency) {
    throw new Error("There was no specified currency for this property")
  }

  return currency.trim().toUpperCase() as Currency
}

export async function scrapeProduct(
  url: string,
  init?: RequestInit,
): Promise<ScrapedProduct> {
  const requestUrl = new URL("/api/scraper/product", window.location.origin)
  requestUrl.searchParams.set("url", url)

  const res = await fetch(requestUrl, init)

  const data = await res.json()

  return ScrapedProduct.parse(data)
}

export async function scrapeImage(url: string): Promise<Blob> {
  const requestUrl = new URL("/api/scraper/image", window.location.origin)
  requestUrl.searchParams.set("url", url)

  const res = await fetch(requestUrl)

  return res.blob()
}
