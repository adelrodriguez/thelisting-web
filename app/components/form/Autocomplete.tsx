import { Combobox } from "@headlessui/react"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid"
import { useVirtualizer } from "@tanstack/react-virtual"
import clsx from "clsx"
import { useRef, useState } from "react"
import { useField } from "remix-validated-form"

type AutocompleteOption = {
  label: string
  value: string | undefined
}

/**
 * This component should only be used within a Form component.
 */
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
        <Combobox.Label className="flex justify-between text-sm font-medium leading-6 text-gray-900">
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
        <div className="relative my-1">
          <Combobox.Input<T["value"]>
            className={clsx(
              "w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10  shadow-sm ring-1 ring-inset ",
              "focus:ring-2 focus:ring-inset",
              "sm:text-sm sm:leading-6",
              error
                ? "text-red-900 ring-red-300 focus:ring-red-500"
                : "text-gray-900 ring-gray-300 focus:ring-slate-600"
            )}
            displayValue={(value) =>
              options.find((o) => o.value === value)?.label || ""
            }
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronUpDownIcon
              aria-hidden="true"
              className="h-5 w-5 text-gray-400"
            />
          </Combobox.Button>
          {filteredOptions.length > 0 && (
            <VirtualizedOptions options={filteredOptions} />
          )}
        </div>
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
      </Combobox>
    </>
  )
}

function VirtualizedOptions({ options }: { options: AutocompleteOption[] }) {
  const ref = useRef<HTMLUListElement>(null)

  const virtualizer = useVirtualizer({
    count: options.length,
    estimateSize: () => 36,
    getScrollElement: () => ref.current,
    overscan: 20,
  })

  return (
    <Combobox.Options
      className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      ref={ref}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
          width: "100%",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <Combobox.Option
            className={({ active }) =>
              clsx(
                "absolute left-0 top-0 w-full cursor-default select-none py-2 pl-8 pr-4",
                active ? "bg-slate-600 text-white" : "text-gray-900"
              )
            }
            key={virtualItem.key}
            style={{
              height: `${virtualItem.size}px`,

              transform: `translateY(${virtualItem.start}px)`,
            }}
            value={options[virtualItem.index]?.value}
          >
            {({ active, selected }) => (
              <>
                <span
                  className={clsx("block truncate", {
                    "font-semibold": selected,
                  })}
                >
                  {options[virtualItem.index]?.label}
                </span>

                {selected && (
                  <span
                    className={clsx(
                      "absolute inset-y-0 left-0 flex items-center pl-1.5",
                      active ? "text-white" : "text-slate-600"
                    )}
                  >
                    <CheckIcon aria-hidden="true" className="h-5 w-5" />
                  </span>
                )}
              </>
            )}
          </Combobox.Option>
        ))}
      </div>
    </Combobox.Options>
  )
}
