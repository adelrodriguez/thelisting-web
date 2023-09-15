import { useNavigate } from "@remix-run/react"
import i18next from "i18next"
import { type ChangeEvent } from "react"

import type { Currency } from "~/config/consts"
import { useExchangeRate } from "~/utils/hooks"

import { Select } from "../common"

export default function LanguageCurrencySelector() {
  const navigate = useNavigate()

  const { currency, setCurrency } = useExchangeRate()

  function handleLanguageChange(e: ChangeEvent<HTMLSelectElement>) {
    void i18next.changeLanguage(e.target.value, () => {
      const params = new URLSearchParams({ lng: i18next.language })
      navigate("?" + params, { preventScrollReset: true })
    })
  }

  function handleCurrencyChange(e: ChangeEvent<HTMLSelectElement>) {
    setCurrency(e.target.value as Currency)
  }

  return (
    <form className="mt-4 space-y-4 sm:max-w-xs">
      <fieldset className="w-full">
        <label htmlFor="language" className="sr-only">
          Language
        </label>
        <div className="relative">
          <Select
            id="language"
            name="language"
            onChange={handleLanguageChange}
            value={i18next.language}
            options={[
              { label: "Spanish", value: "es" },
              { label: "English", value: "en" },
            ]}
          />
        </div>
      </fieldset>
      <fieldset className="w-full">
        <label htmlFor="currency" className="sr-only">
          Currency
        </label>
        <div className="relative mt-1.5">
          <Select
            id="currency"
            name="currency"
            value={currency}
            options={[
              { label: "🇩🇴 DOP", value: "DOP" },
              { label: "🇺🇸 USD", value: "USD" },
            ]}
            onChange={handleCurrencyChange}
          />
        </div>
      </fieldset>
    </form>
  )
}
