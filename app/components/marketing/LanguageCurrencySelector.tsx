import { ChevronDownIcon } from "@heroicons/react/20/solid"
import i18next from "i18next"
import type { ChangeEvent } from "react"

export default function LanguageCurrencySelector() {
  function handleLanguageChange(e: ChangeEvent<HTMLSelectElement>) {
    i18next.changeLanguage(e.target.value)
  }

  return (
    <>
      <h3 className="text-base font-medium text-white">
        Language &amp; Currency
      </h3>
      <form className="mt-4 space-y-4 sm:max-w-xs">
        <fieldset className="w-full">
          <label htmlFor="language" className="sr-only">
            Language
          </label>
          <div className="relative">
            <select
              id="language"
              name="language"
              className="block w-full rounded-md border border-transparent bg-gray-800 bg-none text-base text-white focus:border-white focus:ring-white sm:text-sm"
              defaultValue="English"
              onChange={handleLanguageChange}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDownIcon
                className="h-4 w-4 text-white"
                aria-hidden="true"
              />
            </div>
          </div>
        </fieldset>
        <fieldset className="w-full">
          <label htmlFor="currency" className="sr-only">
            Currency
          </label>
          <div className="relative mt-1.5">
            <select
              id="currency"
              name="currency"
              className="block w-full rounded-md border border-transparent bg-gray-800 bg-none text-base text-white focus:border-white focus:ring-white sm:text-sm"
              defaultValue="AUD"
            >
              <option>🇩🇴 DOP</option>
              <option disabled>🇺🇸 USD</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDownIcon
                className="h-4 w-4 text-white"
                aria-hidden="true"
              />
            </div>
          </div>
        </fieldset>
      </form>
    </>
  )
}
