import type { ComponentProps } from "react"
import { useField } from "remix-validated-form"

import { Checkbox as BaseCheckbox } from "~/components/common"
import type { Input } from "~/components/form"

/**
 * This component should only be used within a Form component.
 */
export default function Checkbox({
  className,
  description,
  label,
  name,
  ...props
}: ComponentProps<typeof Input>) {
  const { defaultValue, error, getInputProps } = useField(name)

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
          <label className="font-medium text-gray-900" htmlFor={name}>
            {label}
          </label>
          {description && (
            <p className="text-gray-500" id={`${name}-description`}>
              {description}
            </p>
          )}
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    </div>
  )
}
