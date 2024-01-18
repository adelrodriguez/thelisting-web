import { RadioGroup } from "@headlessui/react"
import clsx from "clsx"

type ListRadioOption = {
  description?: string
  label: string
}

export default function ListRadioGroup<T extends ListRadioOption>({
  description,
  error = false,
  id,
  label,
  name,
  onChange,
  options,
  required,
  value,
}: {
  description?: string
  error?: boolean
  label?: string
  onChange: (value: T) => void
  options: T[]
  required?: boolean
  value: T
  name: string
  id?: string
}) {
  return (
    <RadioGroup name={name} onChange={onChange} value={value}>
      {label && (
        <RadioGroup.Label className="block text-sm font-medium text-gray-700">
          {label}
          {required && (
            <span aria-hidden="true" className="text-xs text-red-500">
              {" "}
              *
            </span>
          )}
        </RadioGroup.Label>
      )}

      <div className="mt-1 -space-y-px rounded-md bg-white">
        {options.map((option, optionIdx) => (
          <RadioGroup.Option
            className={clsx(
              "relative flex cursor-pointer border  p-4 focus:outline-none ui-checked:z-10 ",
              {
                "border-gray-300": !error,
                "border-red-300": error,
                "rounded-bl-md rounded-br-md": optionIdx === options.length - 1,
                "rounded-tl-md rounded-tr-md": optionIdx === 0,
                "ui-checked:z-10 ui-checked:border-gray-300 ui-checked:bg-gray-50":
                  !error,
                "ui-checked:z-10 ui-checked:border-red-300 ui-checked:bg-red-50":
                  error,
              },
            )}
            key={option.label}
            value={option}
          >
            <span
              aria-hidden="true"
              className={clsx(
                "mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white ui-checked:border-transparent ui-active:ring-2 ui-active:ring-offset-2",
                {
                  "ui-checked:bg-gray-600 ui-active:ring-gray-500": !error,
                  "ui-checked:bg-red-600 ui-active:ring-red-500": error,
                },
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <span className="ml-3 flex flex-col">
              <RadioGroup.Label
                as="span"
                className="block text-sm font-medium text-gray-900 ui-checked:text-gray-900"
              >
                {option.label}
              </RadioGroup.Label>
              {option.description && (
                <RadioGroup.Description
                  as="span"
                  className="block text-sm text-gray-500 ui-checked:text-gray-700"
                >
                  {option.description}
                </RadioGroup.Description>
              )}
            </span>
          </RadioGroup.Option>
        ))}
      </div>
      {description && (
        <p
          className={clsx("mt-2 text-sm", {
            "text-gray-500": !error,
            "text-red-600": error,
          })}
          id={error ? `${id}-error` : `${id}-description`}
        >
          {description}
        </p>
      )}
    </RadioGroup>
  )
}
