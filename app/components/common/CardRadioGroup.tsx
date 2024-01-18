import { RadioGroup } from "@headlessui/react"
import { CheckCircleIcon } from "@heroicons/react/20/solid"

type CardRadioGroupOption = {
  value: string
  title: string
  description: string
  footer?: string
}

export default function CardRadioGroup({
  label,
  onChange,
  options,
  value,
}: {
  label?: string
  value: CardRadioGroupOption["value"] | null | undefined
  options: CardRadioGroupOption[]
  onChange: (value: CardRadioGroupOption["value"]) => void
}) {
  return (
    <RadioGroup onChange={onChange} value={value}>
      {label && (
        <RadioGroup.Label className="text-base font-semibold leading-6 text-gray-900">
          {label}
        </RadioGroup.Label>
      )}

      <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-4">
        {options.map((option) => (
          <RadioGroup.Option
            className="relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm focus:outline-none ui-active:border-slate-600 ui-active:ring-2 ui-active:ring-slate-600"
            key={option.value}
            value={option.value}
          >
            <span className="flex flex-1">
              <span className="flex flex-col">
                <RadioGroup.Label
                  as="span"
                  className="block text-sm font-medium text-gray-900"
                >
                  {option.title}
                </RadioGroup.Label>
                <RadioGroup.Description
                  as="span"
                  className="mt-1 flex items-center text-sm text-gray-500"
                >
                  {option.description}
                </RadioGroup.Description>
                {option.footer && (
                  <RadioGroup.Description
                    as="span"
                    className="mt-6 text-sm font-medium text-gray-900"
                  >
                    {option.footer}
                  </RadioGroup.Description>
                )}
              </span>
            </span>
            <CheckCircleIcon
              aria-hidden="true"
              className="h-5 w-5 text-slate-600 ui-not-checked:invisible"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent ui-checked:border-slate-600 ui-active:border"
            />
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
