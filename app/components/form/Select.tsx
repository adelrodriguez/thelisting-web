import { ExclamationCircleIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import type {
  OptionHTMLAttributes,
  SelectHTMLAttributes,
  FocusEvent,
} from "react"
import { useState } from "react"
import type { z } from "zod"

type SelectOption = {
  label: string
  value: OptionHTMLAttributes<HTMLOptionElement>["value"]
  disabled?: boolean
}

export default function Select<T extends SelectOption>({
  className,
  schema,
  description,
  error,
  label,
  options,
  placeholder,
  required,
  ...props
}: {
  label: string
  description?: string
  error?: boolean
  options: T[]
  placeholder?: string
  /**
   * The Zod schema used to validate the input client-side
   */
  schema?: z.ZodSchema
} & SelectHTMLAttributes<HTMLSelectElement>) {
  const { name } = props
  const [validationError, setValidationError] = useState("")

  function validate(event: FocusEvent<HTMLSelectElement>) {
    const $select = event.currentTarget

    if (!schema) return

    const result = schema.safeParse($select.value)

    $select.setCustomValidity(
      result.success ? "" : result.error.flatten().formErrors[0]!
    )

    setValidationError($select.validationMessage)
  }

  return (
    <div className={className}>
      <div className="flex justify-between">
        <label
          className="block text-sm font-medium leading-6 text-gray-900"
          htmlFor={name}
        >
          {label}
        </label>
        {required && (
          <span className="text-sm leading-6 text-gray-500">Required</span>
        )}
      </div>
      <div className="relative">
        <select
          {...props}
          className={clsx(
            "peer my-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-slate-300",
            "placeholder:text-gray-400",
            "sm:text-sm sm:leading-6",
            "focus:ring-2 focus:ring-inset focus:ring-slate-600",
            "disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500",
            "invalid:pr-10 invalid:text-red-900 invalid:placeholder-red-300 invalid:ring-red-300 invalid:focus:outline-none invalid:focus:ring-red-500"
          )}
          onSelect={validate}
          onChange={validate}
        >
          {options.map((option) => (
            <option
              key={`${option.value}`}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none invisible absolute right-7 top-0 flex h-9 items-center peer-invalid:visible">
          <ExclamationCircleIcon
            className="h-5 w-5 text-red-500"
            aria-hidden="true"
          />
        </div>
        {description && (
          <p className="text-sm text-gray-500 peer-invalid:hidden">
            {description}
          </p>
        )}
        <p className="hidden text-sm text-red-600 peer-invalid:block">
          {validationError}
        </p>
      </div>
    </div>
  )
}
