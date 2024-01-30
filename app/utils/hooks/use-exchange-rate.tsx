import { useSearchParams } from "@remix-run/react"
import { useQuery } from "@tanstack/react-query"
import { type ReactNode, createContext, useContext } from "react"

import type { Currency } from "~/config/consts"
import { CURRENCIES, ONE_HOUR, ONE_MINUTE } from "~/config/consts"

const Context = createContext<
  | {
      exchangeRate: number
      currency: Currency
      setCurrency: (currency: Currency) => void
    }
  | undefined
>(undefined)

Context.displayName = "ExchangeRate"

// TODO(adelrodriguez): Add initial currency to prevent flash of content
export function ExchangeRateProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const currency =
    (searchParams.get("currency") as Currency | null) ?? CURRENCIES.DOP

  const { data } = useQuery({
    queryFn: async () => {
      const res = await fetch("/api/exchange-rates/" + currency)
      const data = (await res.json()) as { exchangeRate: number }

      return data
    },
    queryKey: ["exchange-rates", currency],

    refetchInterval: ONE_MINUTE.inMilliseconds * 5,
    select: (data) => {
      return data.exchangeRate
    },
    staleTime: ONE_HOUR.inMilliseconds,
  })

  function handleSetCurrency(currency: Currency) {
    setSearchParams(
      (params) => {
        params.set("currency", currency)

        return params
      },
      { preventScrollReset: true },
    )
  }

  return (
    <Context.Provider
      value={{
        currency,
        exchangeRate: data ?? 1,
        setCurrency: handleSetCurrency,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export default function useExchangeRate() {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error(
      "useExchangeRate must be used within a ExchangeRateProvider",
    )
  }

  return context
}
