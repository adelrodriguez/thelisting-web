import { assign, send } from "xstate/lib/actions"
import { createModel } from "xstate/lib/model"

import type { ScrapedProductResult } from "~/utils/scraper"
import { scrapeProduct } from "~/utils/scraper"

const scraperModel = createModel(
  {
    completed: [] as ScrapedProductResult[],
    controller: null as AbortController | null,
    pending: [] as string[],
  },
  {
    events: {
      CANCEL: () => ({}),
      ERROR: (payload: Error) => ({ payload }),
      FINISHED: (payload: ScrapedProductResult) => ({ payload }),
      RESET: () => ({}),
      START: (payload: string[]) => ({ payload }),
    },
  },
)

const setPending = scraperModel.assign(
  {
    controller: () => new AbortController(),
    pending: (_, event) => event.payload,
  },
  "START",
)

const reset = scraperModel.assign({ completed: [], pending: [] }, "RESET")

const scraperMachine = scraperModel.createMachine(
  {
    context: { completed: [], controller: null, pending: [] },
    id: "scraper",
    initial: "idle",
    predictableActionArguments: true,
    states: {
      finished: {
        always: [
          {
            cond: "hasPending",
            target: "scraping",
          },
          {
            cond: "isComplete",
            target: "idle",
          },
        ],
      },
      idle: {
        entry: reset,
        on: {
          START: {
            actions: setPending,
            target: "scraping",
          },
        },
      },
      scraping: {
        invoke: {
          id: "fetchProducts",
          onDone: {
            actions: [
              send((_, event) => ({ payload: event.data, type: "FINISHED" })),
              assign({
                completed: (context, event) => [
                  ...context.completed,
                  event.data,
                ],
                pending: (context) => context.pending.slice(1),
              }),
            ],
            target: "finished",
          },
          onError: {
            actions: send((_, event) => ({
              payload: event.data,
              type: "ERROR",
            })),
          },
          src: async (context) => {
            const [url] = context.pending
            if (!url) {
              throw new Error("URL is required")
            }

            const data = await scrapeProduct(url, {
              signal: context.controller?.signal,
            })

            return data
          },
        },
        on: {
          CANCEL: {
            actions: (context) => {
              context.controller?.abort()
            },
            target: "idle",
          },
          ERROR: {
            target: "idle",
          },
        },
      },
    },
  },
  {
    guards: {
      hasPending: (context) => context.pending.length !== 0,
      isComplete: (context) => context.pending.length === 0,
    },
  },
)

export default scraperMachine
