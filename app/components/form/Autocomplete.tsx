import { Combobox } from "@headlessui/react"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { useState } from "react"
import { useField } from "remix-validated-form"

type AutocompleteOption = {
  label: string
  value: string
}

export default function Autocomplete<T extends AutocompleteOption>({
  name,
  label,
  required,
  options,
  description,
}: {
  name: string
  label: string
  required?: boolean
  description?: string
  options: T[]
}) {
  const [query, setQuery] = useState("")
  const { getInputProps, error } = useField(name)

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) =>
          option.label.toLowerCase().includes(query.toLowerCase())
        )

  return (
    <>
      <Combobox as="div" {...getInputProps()}>
        <Combobox.Label className="block text-sm font-medium leading-6 text-gray-900">
          <label
            className="block text-sm font-medium leading-6 text-gray-900"
            htmlFor={name}
          >
            {label}
          </label>
          {required && (
            <span className="text-sm leading-6 text-gray-500">Required</span>
          )}
        </Combobox.Label>
        <div className="relative mt-2">
          <Combobox.Input<T["value"]>
            className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6"
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(value) =>
              options.find((o) => o.value === value)?.label || ""
            }
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>

          {filteredOptions.length > 0 && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredOptions.map((option) => (
                <Combobox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    clsx(
                      "relative cursor-default select-none py-2 pl-8 pr-4",
                      active ? "bg-slate-600 text-white" : "text-gray-900"
                    )
                  }
                >
                  {({ active, selected }) => (
                    <>
                      <span
                        className={clsx(
                          "block truncate",
                          selected && "font-semibold"
                        )}
                      >
                        {option.label}
                      </span>

                      {selected && (
                        <span
                          className={clsx(
                            "absolute inset-y-0 left-0 flex items-center pl-1.5",
                            active ? "text-white" : "text-slate-600"
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
      {description && (
        <p
          className={clsx("text-sm text-gray-500", {
            hidden: error,
          })}
          id={`${name}-description`}
        >
          {description}
        </p>
      )}
      <p className={clsx("text-sm text-red-600", error ? "block" : "hidden")}>
        {error}
      </p>
    </>
  )
}
