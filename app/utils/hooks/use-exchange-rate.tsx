import { useQuery } from "@tanstack/react-query"
import { type ReactNode, createContext, useState, useContext } from "react"

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

export function ExchangeRateProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES.DOP)
  const { data } = useQuery(
    ["exchange-rates", currency],
    async () => {
      const res = await fetch("/api/exchange-rates/" + currency)
      const data = (await res.json()) as { exchangeRate: number }

      return data as { exchangeRate: number }
    },
    {
      refetchInterval: ONE_MINUTE.inMilliseconds * 5,
      select: (data) => {
        return data.exchangeRate
      },
      staleTime: ONE_HOUR.inMilliseconds,
    }
  )

  return (
    <Context.Provider
      value={{ currency, exchangeRate: data ?? 1, setCurrency }}
    >
      {children}
    </Context.Provider>
  )
}

export function useExchangeRate() {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error(
      "useExchangeRate must be used within a ExchangeRateProvider"
    )
  }

  return context
}
