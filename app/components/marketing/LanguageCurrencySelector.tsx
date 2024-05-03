import { useSearchParams } from "@remix-run/react"
import i18next from "i18next"
import posthog from "posthog-js"
import type { ChangeEvent } from "react"
import { useTranslation } from "react-i18next"

import { Select } from "~/components/common"
import type { Currency } from "~/config/consts"
import { useExchangeRate } from "~/utils/hooks"

export default function LanguageCurrencySelector({
  showLabels = false,
}: {
  showLabels?: boolean
}) {
  const [, setSearchParams] = useSearchParams()
  const { currency, setCurrency } = useExchangeRate()
  const { t } = useTranslation("common")

  function handleLanguageChange(e: ChangeEvent<HTMLSelectElement>) {
    void i18next.changeLanguage(e.target.value, () => {
      posthog.capture("language_changed", { language: e.target.value })

      setSearchParams(
        (params) => {
          params.set("lng", e.target.value)

          return params
        },
        { preventScrollReset: true },
      )
    })
  }

  function handleCurrencyChange(e: ChangeEvent<HTMLSelectElement>) {
    posthog.capture("currency_changed", { currency: e.target.value })

    setCurrency(e.target.value as Currency)
  }

  return (
    <form className="mt-4 w-full space-y-4">
      <fieldset className="w-full">
        <label className="sr-only" htmlFor="language">
          Language
        </label>
        <div className="relative">
          <Select
            id="language"
            name="language"
            onChange={handleLanguageChange}
            options={[
              { label: "Español", value: "es" },
              { label: "English", value: "en" },
            ]}
            value={i18next.language}
            {...(showLabels ? { label: t("language") } : {})}
          />
        </div>
      </fieldset>
      <fieldset className="w-full">
        <label className="sr-only" htmlFor="currency">
          Currency
        </label>
        <div className="relative mt-1.5">
          <Select
            id="currency"
            name="currency"
            onChange={handleCurrencyChange}
            options={[
              { label: "🇩🇴 DOP", value: "DOP" },
              { label: "🇺🇸 USD", value: "USD" },
            ]}
            value={currency}
            {...(showLabels ? { label: t("currency") } : {})}
          />
        </div>
      </fieldset>
    </form>
  )
}
