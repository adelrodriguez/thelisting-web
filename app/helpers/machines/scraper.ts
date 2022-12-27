import { assign, send } from "xstate"
import { createModel } from "xstate/lib/model"

import type { ScrapedProductResult } from "~/utils/scraper"
import { scrapeProduct } from "~/utils/scraper"

const scraperModel = createModel(
  {
    completed: [] as ScrapedProductResult[],
    pending: [] as string[],
  },
  {
    events: {
      CANCEL: () => ({}),
      FINISHED: (payload: ScrapedProductResult) => ({ payload }),
      RESET: () => ({}),
      START: (payload: string[]) => ({ payload }),
    },
  }
)

const setPending = scraperModel.assign(
  {
    pending: (_, event) => event.payload,
  },
  "START"
)

const reset = scraperModel.assign({ completed: [], pending: [] }, "RESET")

const scraperMachine = scraperModel.createMachine(
  {
    context: { completed: [], pending: [] },
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
          onDone: [
            {
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
          ],
          src: async (context) => {
            const [url] = context.pending
            const data = await scrapeProduct(url)
            return data
          },
        },
        on: {
          CANCEL: {
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
  }
)

export default scraperMachine
