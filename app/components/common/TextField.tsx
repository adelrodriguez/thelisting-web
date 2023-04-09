import { ExclamationCircleIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import type { FocusEvent } from "react"
import { useRef, useState } from "react"
import type { AriaTextFieldProps } from "react-aria"
import { useTextField } from "react-aria"
import type { z } from "zod"

export default function TextField({
  validator,
  className,
  ...props
}: {
  className?: string
  validator?: z.ZodSchema
} & Omit<AriaTextFieldProps, "errorMessage">) {
  const ref = useRef(null)
  const [errorMessage, setErrorMessage] = useState("")
  const { labelProps, inputProps, errorMessageProps, descriptionProps } =
    useTextField(
      {
        ...props,
        errorMessage,
      },
      ref
    )
  const { label, isRequired, description, isDisabled } = props
  const hasError = !!errorMessage

  function validate(event: FocusEvent<Element>) {
    const $input = event.currentTarget as HTMLInputElement
    const value = $input.value

    if (!validator) return

    let errorMessage = ""

    if (validator) {
      const result = validator.safeParse(value)

      errorMessage = result.success ? "" : result.error.flatten().formErrors[0]!
    }

    $input.setCustomValidity(errorMessage)
    setErrorMessage(errorMessage)
  }

  return (
    <div className={className}>
      <div className="flex justify-between">
        <label
          {...labelProps}
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {label}
        </label>
        {isRequired && (
          <span className="text-sm leading-6 text-gray-500">Required</span>
        )}
      </div>
      <div className={clsx({ "mt-1": !!label })}>
        <div className="relative">
          <input
            {...inputProps}
            ref={ref}
            onBlur={validate}
            className={clsx(
              "block",
              "w-full",
              "shadow-sm",
              "rounded-md",
              "sm:text-sm",
              {
                "border-gray-300": !hasError,
                "border-gray-300 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500":
                  isDisabled,
                "border-red-300": hasError,
                "focus:border-gray-500 focus:ring-gray-500": !hasError,
                "focus:border-red-500 focus:outline-none focus:ring-red-500":
                  hasError,
                "pr-10": hasError,
                "text-red-900 placeholder-red-300": hasError,
              }
            )}
          />
          {hasError && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        <div className="mt-1 text-sm">
          {description && (
            <p
              {...descriptionProps}
              className={clsx("text-gray-500", { hidden: hasError })}
            >
              {description}
            </p>
          )}
          {hasError && (
            <p
              {...errorMessageProps}
              className={clsx("text-red-600", { hidden: !errorMessage })}
            >
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
