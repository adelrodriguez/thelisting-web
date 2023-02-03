import { RadioGroup } from "@headlessui/react"
import clsx from "clsx"

type ListRadioOption = {
  description: string
  label: string
}

export default function ListRadioGroup<T extends ListRadioOption>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string
  options: T[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <RadioGroup value={value} onChange={onChange}>
      {label && (
        <RadioGroup.Label className="block text-sm font-medium text-gray-700">
          {label}
        </RadioGroup.Label>
      )}

      <div className="mt-1 -space-y-px rounded-md bg-white">
        {options.map((option, optionIdx) => (
          <RadioGroup.Option
            key={option.label}
            value={option}
            className={clsx(
              "relative flex cursor-pointer border border-gray-200 p-4 focus:outline-none ui-checked:z-10 ui-checked:border-indigo-200 ui-checked:bg-indigo-50",
              {
                "rounded-bl-md rounded-br-md": optionIdx === options.length - 1,
                "rounded-tl-md rounded-tr-md": optionIdx === 0,
              }
            )}
          >
            <span
              className="mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white ui-checked:border-transparent ui-checked:bg-indigo-600 ui-active:ring-2 ui-active:ring-indigo-500 ui-active:ring-offset-2"
              aria-hidden="true"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <span className="ml-3 flex flex-col">
              <RadioGroup.Label
                as="span"
                className="block text-sm font-medium text-gray-900 ui-checked:text-indigo-900"
              >
                {option.label}
              </RadioGroup.Label>
              <RadioGroup.Description
                as="span"
                className="block text-sm text-gray-500 ui-checked:text-indigo-700"
              >
                {option.description}
              </RadioGroup.Description>
            </span>
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
