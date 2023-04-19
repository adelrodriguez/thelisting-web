import type { ComponentProps } from "react"
import { useField } from "remix-validated-form"

import { Checkbox as BaseCheckbox } from "~/components/common"
import type { Input } from "~/components/form"

export default function Checkbox({
  name,
  label,
  className,
  description,
  required,
  ...props
}: ComponentProps<typeof Input>) {
  const { getInputProps, error, defaultValue } = useField(name)

  return (
    <div className={className}>
      <div className="relative flex items-start">
        <div className="flex h-6 items-center">
          <BaseCheckbox
            {...getInputProps({
              ...props,
              id: name,
              ...(description
                ? { "aria-describedby": `${name}-description` }
                : {}),
            })}
            className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-slate-600"
            defaultChecked={defaultValue}
          />
        </div>
        <div className="ml-3 text-sm leading-6">
          <label htmlFor={name} className="font-medium text-gray-900">
            {label}
          </label>
          {description && (
            <p id={`${name}-description`} className="text-gray-500">
              {description}
            </p>
          )}
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    </div>
  )
}
