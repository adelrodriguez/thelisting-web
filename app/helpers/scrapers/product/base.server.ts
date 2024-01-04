import { performance } from "perf_hooks"
import type { Browser, Page } from "playwright"
import type { Logger } from "winston"

import type { Currency } from "~/config/consts"
import { CurrencySchema } from "~/utils/money"
import { ScrapedProduct, cleanAmount, cleanText } from "~/utils/scraper"

export type ScraperConfig = {
  url: URL
  browser: Browser
  logger: Logger
}

interface ScraperConstructor {
  new (config: ScraperConfig): ScraperInterface
}

export interface ScraperInterface {
  exec(): Promise<ScrapedProduct>
  logError(message: string): void

  store: string | null
  title: Promise<string | null>
  description: Promise<string | null>
  image: Promise<string | null>
  amount: Promise<number | null>
  currency: Promise<Currency | null> | Currency
}

// TODO: Create error handler for all the functions to avoid WET
export default function createScraperFactory(config: ScraperConfig) {
  return function (ctor: ScraperConstructor): ScraperInterface {
    return new ctor(config)
  }
}

export class BaseScraper implements ScraperInterface {
  private readonly url: string
  private readonly browser: Browser
  private readonly logger: Logger

  protected page!: Page
  protected waitFor?(): Promise<void>

  constructor({ url, browser, logger }: ScraperConfig) {
    this.url = url.toString()
    this.browser = browser
    this.logger = logger
  }

  /**
   * The name of the store
   */
  public get store(): string | null {
    return null
  }

  public get title(): Promise<string | null> {
    return this.page
      .$eval("meta[name=title]", (element) => element.getAttribute("content"))
      .then(cleanText)
      .catch((err) => this.logError(err.message))
  }

  public get description(): Promise<string | null> {
    return this.page
      .$eval("meta[name=description]", (element) =>
        element.getAttribute("content"),
      )
      .then(cleanText)
      .catch((err) => this.logError(err.message))
  }

  public get image(): Promise<string | null> {
    return this.page
      .$eval("meta[property='og:image']", (element) =>
        element.getAttribute("content"),
      )
      .catch((err) => this.logError(err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval("meta[property='product:price:amount']", (element) =>
        element.getAttribute("content"),
      )
      .then(cleanAmount)
      .catch((err) => this.logError(err.message))
  }

  public get currency(): Promise<Currency | null> | Currency {
    return this.page
      .$eval("meta[property='product:price:currency']", (element) =>
        element.getAttribute("content"),
      )
      .then(cleanText)
      .then(CurrencySchema.parse)
      .catch((err) => this.logError(err.message))
  }

  public async exec(): Promise<ScrapedProduct> {
    this.logger.info(`Initializing scraper for store: ${this.store}`)
    const startTime = performance.now()

    try {
      // Create a new incognito browser context.
      const context = await this.browser.newContext()

      // Create a new page in a pristine context.
      this.page = await context.newPage()

      await this.page.goto(this.url)

      this.logger.info(`Scrapping product from store "${this.store}"`)
    } catch (err) {
      const error = err as Error
      this.logError(error.message)
    }

    if (this.waitFor) {
      try {
        await this.waitFor()
      } catch (error) {
        this.logError((error as Error).message)
      }
    }

    const title = await this.title
    const description = await this.description
    const image = await this.image
    const amount = await this.amount
    const currency = await this.currency

    await this.page.close()

    const duration = performance.now() - startTime

    const payload: ScrapedProduct = {
      duration,
      errors: [],
      fields: {
        amount,
        currency,
        description,
        image,
        store: this.store,
        title,
      },
      time: new Date().getTime(),
      url: this.url,
    }

    Object.entries(payload.fields).forEach(([key, value]) => {
      if (value === null) payload.errors.push(key)
    })

    return payload
  }

  /**
   * Logs error messages to the console
   * @param message An error message
   * @returns {null} Returns null to avoid WET
   */
  public logError(message: string): null {
    this.logger.error(message, { url: this.url })

    return null
  }
}
