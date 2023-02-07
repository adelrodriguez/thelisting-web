import { performance } from "perf_hooks"
import type { Browser, Page } from "playwright"
import { chromium } from "playwright"
import UserAgent from "user-agents"

import type { Currency } from "~/config/consts"
import { BROWSERLESS_TOKEN, BROWSERLESS_URL } from "~/config/env.server"
import Sentry from "~/services/sentry"
import { logger } from "~/utils/log"
import { CurrencySchema } from "~/utils/money"
import { cleanAmount, cleanText } from "~/utils/scraper"

const userAgent = new UserAgent()

interface ScraperConstructor {
  new (url: URL): ScraperInterface
}

export interface ScraperInterface {
  init(): Promise<void>
  stop(): Promise<void>

  url: string
  store: string | null
  title: Promise<string | null>
  description: Promise<string | null>
  image: Promise<string | null>
  amount: Promise<number | null>
  currency: Promise<Currency | null> | Currency
  notes?: Promise<string | null>
  start: number
  duration: number

  logError(message: string): void
}

// TODO: Create error handler for all the functions to avoid WET
export default function createScraperFactory(url: URL) {
  return function (ctor: ScraperConstructor): ScraperInterface {
    return new ctor(url)
  }
}

// TODO(adelrodriguez): Turn into an abstract class
export class BaseScraper implements ScraperInterface {
  private readonly _url: URL

  private browser!: Browser
  protected page!: Page
  private _start?: number
  private _duration?: number

  protected waitFor?(): Promise<void>

  readonly waitForSelector?: string

  constructor(url: URL) {
    this._url = url
    this._start = undefined
    this._duration = undefined
  }

  public get url(): string {
    return this._url.toString()
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
        element.getAttribute("content")
      )
      .then(cleanText)
      .catch((err) => this.logError(err.message))
  }

  public get image(): Promise<string | null> {
    return this.page
      .$eval("meta[property='og:image']", (element) =>
        element.getAttribute("content")
      )
      .catch((err) => this.logError(err.message))
  }

  public get amount(): Promise<number | null> {
    return this.page
      .$eval("meta[property='product:price:amount']", (element) =>
        element.getAttribute("content")
      )
      .then(cleanAmount)
      .catch((err) => this.logError(err.message))
  }

  public get currency(): Promise<Currency | null> | Currency {
    return this.page
      .$eval("meta[property='product:price:currency']", (element) =>
        element.getAttribute("content")
      )
      .then(cleanText)
      .then(CurrencySchema.parse)
      .catch((err) => this.logError(err.message))
  }

  public get start(): number {
    return this._start || 0
  }

  public get duration(): number {
    return this._duration || 0
  }

  public async init(): Promise<void> {
    try {
      logger.info(`Initializing scraper for store: ${this.store}`)
      this._start = performance.now()

      this.browser = await chromium.connectOverCDP(
        `${BROWSERLESS_URL}?token=${BROWSERLESS_TOKEN}`
      )
      this.page = await this.browser.newPage({
        userAgent: userAgent.toString(),
      })

      await this.page.goto(this.url)

      logger.info(`Scrapping product from store "${this.store}"`)
    } catch (err) {
      const error = err as Error
      this.logError(error.message)
    }

    if (this.waitFor) {
      await this.waitFor()
    }
  }

  public async stop(): Promise<void> {
    await this.page.close()
    await this.browser.close()
    this._duration = performance.now() - this.start
  }

  /**
   * Logs error messages to the console
   * @param message An error message
   * @returns {null} Returns null to avoid WET
   */
  public logError(message: string): null {
    logger.error(message, { url: this.url })
    Sentry.captureException({ message, url: this.url })

    return null
  }
}
