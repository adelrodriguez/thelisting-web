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
}
