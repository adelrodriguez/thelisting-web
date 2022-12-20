import { assign, send } from "xstate"
import { createModel } from "xstate/lib/model"

import type {
  ScraperProductRequest,
  ScraperProductResponse,
} from "~/types/scraper"
import { scrapeProduct } from "~/utils/scraper"

const scraperModel = createModel(
  {
    completed: [] as ScraperProductResponse[],
    pending: [] as ScraperProductRequest[],
  },
  {
    events: {
      CANCEL: () => ({}),
      FINISHED: (payload: ScraperProductResponse) => ({ payload }),
      RESET: () => ({}),
      START: (payload: ScraperProductRequest[]) => ({ payload }),
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
            const [payload] = context.pending
            const data = await scrapeProduct(payload.url, `${payload.id}`)
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
