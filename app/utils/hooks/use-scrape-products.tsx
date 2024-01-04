import { useQueries, useQueryClient } from "@tanstack/react-query"
import { route } from "routes-gen"

import { ScrapedProduct } from "~/utils/scraper"

const QUERY_KEY = "scrape-product"

export default function useScrapeProducts<T extends { url: string }>(
  options: {
    data: T[]
    onSuccess?: (product: ScrapedProduct, index: number) => void
  } & ({ mode: "parallel" } | { mode: "sequential"; delay?: number }),
) {
  const queryClient = useQueryClient()

  const queries = useQueries({
    queries: options.data.map((item, index) => ({
      enabled: false,
      // @ts-expect-error Seems this is a bug in the useQueries types. See:
      // https://github.com/TanStack/query/discussions/4785
      queryFn: async ({ signal }) => {
        const response = await fetch(
          route("/api/scraper/product") + `?url=${item.url}`,
          { signal },
        )
        const json = await response.json()

        const product = ScrapedProduct.parse(json)

        if (options.onSuccess) {
          options.onSuccess(product, index)
        }

        return product
      },
      queryKey: [QUERY_KEY, item.url],
    })),
  })
  const isIdle = queries.every((query) => query.fetchStatus === "idle")
  const isPending = queries.some((query) => query.isPending)
  const completed = queries.filter((query) => query.isFetched)
  const remaining = queries.filter((query) => query.isPending)

  async function scrape(indexes: number[]) {
    if (options.mode === "parallel") {
      await Promise.all(
        queries.map(async (query, index) => {
          if (indexes.includes(index)) {
            await query.refetch()
          }
        }),
      )

      return
    }

    if (options.mode === "sequential") {
      for (const index of indexes) {
        await queries[index]?.refetch()

        if (options.delay) {
          await new Promise((resolve) => setTimeout(resolve, options.delay))
        }
      }

      return
    }

    throw new Error("Invalid order")
  }

  async function cancel() {
    await queryClient.cancelQueries({
      queryKey: [QUERY_KEY],
      stale: true,
    })
  }

  return {
    cancel,
    completed,
    isIdle,
    isPending,
    queries,
    remaining,
    scrape,
  }
}
