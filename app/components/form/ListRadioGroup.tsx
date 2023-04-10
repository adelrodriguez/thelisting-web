import { RadioGroup } from "@headlessui/react"
import clsx from "clsx"

type ListRadioOption = {
  label?: string
  description?: string
  value: string
}

export default function ListRadioGroup<T extends ListRadioOption>({
  options,
  label,
  required,
  description,
  name,
  defaultValue,
}: {
  options: T[]
  label: string
  required?: boolean
  description?: string
  name: string
  defaultValue: T["value"]
}) {
  return (
    <RadioGroup name={name} defaultValue={defaultValue}>
      <RadioGroup.Label className="flex justify-between text-sm font-medium leading-6 text-gray-900">
        {label}
        {required && (
          <span className="text-sm leading-6 text-gray-500">Required</span>
        )}
      </RadioGroup.Label>

      <div className="mt-1 -space-y-px rounded-md bg-white">
        {options.map((option, index) => (
          <RadioGroup.Option
            key={option.value}
            value={option.value}
            className={clsx(
              "relative flex cursor-pointer border border-gray-300 p-4 focus:outline-none ui-checked:border-gray-300 ui-checked:bg-gray-50",
              {
                "rounded-bl-md rounded-br-md": index === options.length - 1,
                "rounded-tl-md rounded-tr-md": index === 0,
              }
            )}
          >
            <span
              className={clsx(
                "mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white",
                "ui-checked:border-transparent ui-checked:bg-gray-600 ui-active:ring-2 ui-active:ring-gray-500 ui-active:ring-offset-2"
              )}
              aria-hidden="true"
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
              {description && (
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
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
    </RadioGroup>
  )
}
