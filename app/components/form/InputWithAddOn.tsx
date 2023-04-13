import { ExclamationCircleIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import type { FocusEvent, InputHTMLAttributes } from "react"
import { useState } from "react"
import type { z } from "zod"

export default function InputWithAddOn({
  schema,
  label,
  className,
  description,
  required,
  addOn,
  ...props
}: {
  label: string
  addOn: string
  description?: string
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
      <div className="relative w-full">
        <div
          className={clsx(
            "my-1 flex w-full rounded-md bg-white shadow-sm ring-1 ring-inset ",
            "focus-within:ring-2 focus-within:ring-inset",
            {
              "ring-red-300 focus-within:ring-red-500 focus:outline-none":
                validationError,
              "ring-slate-300 focus-within:ring-slate-500": !validationError,
            }
          )}
        >
          <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
            {addOn}
          </span>
          <input
            {...props}
            onBlur={validate}
            type={props.type ?? "text"}
            className={clsx(
              "peer block w-full flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 shadow-sm",
              "placeholder:text-gray-400",
              "sm:text-sm sm:leading-6",
              "focus:ring-0",
              "disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500",
              "invalid:pr-10 invalid:text-red-900 invalid:placeholder-red-300 invalid:ring-red-300 invalid:focus:outline-none invalid:focus:ring-red-500"
            )}
          />
          <div className="pointer-events-none invisible absolute right-0 top-0 flex h-9 items-center pr-3 peer-invalid:visible">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        </div>
        {description && (
          <p
            className={clsx("text-sm text-gray-500", {
              block: !validationError,
              hidden: validationError,
            })}
          >
            {description}
          </p>
        )}
        <p
          className={clsx(" text-sm text-red-600", {
            block: validationError,
            hidden: !validationError,
          })}
        >
          {validationError}
        </p>
      </div>
    </div>
  )
}
