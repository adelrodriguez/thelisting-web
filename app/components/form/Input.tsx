import { ExclamationCircleIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { useState } from "react"
import type { FocusEvent, InputHTMLAttributes } from "react"
import type { z } from "zod"

export default function Input({
  schema,
  label,
  className,
  description,
  required,
  ...props
}: {
  label: string
  description?: string
  /**
   * The Zod schema used to validate the input client-side
   */
  schema?: z.ZodSchema
} & InputHTMLAttributes<HTMLInputElement>) {
  const [validationError, setValidationError] = useState("")
  const { name } = props

  function validate(event: FocusEvent<HTMLInputElement>) {
    const $input = event.currentTarget

    if (!schema) return

    const result = schema.safeParse($input.value)

    $input.setCustomValidity(
      result.success ? "" : result.error.flatten().formErrors[0]!
    )

    setValidationError($input.validationMessage)
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
        <input
          {...props}
          id={name}
          onBlur={validate}
          className={clsx(
            "peer my-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm",
            "focus:border-gray-500 focus:ring-gray-500",
            "disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500",
            "invalid:border-red-300 invalid:pr-10 invalid:text-red-900 invalid:placeholder-red-300 invalid:focus:border-red-500 invalid:focus:outline-none invalid:focus:ring-red-500"
          )}
          type={props.type ?? "text"}
        />
        <div className="pointer-events-none invisible absolute right-0 top-0 flex translate-y-1/2 items-center pr-3 peer-invalid:visible">
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
