import { ExclamationCircleIcon } from "@heroicons/react/24/solid"
import clsx from "clsx"
import type { InputHTMLAttributes, Ref } from "react"
import { forwardRef } from "react"

function Input(
  {
    addOn,
    className,
    description,
    disabled = false,
    error = false,
    label,
    name,
    id = name,
    placeholder,
    type = "text",
    ...props
  }: {
    addOn?: string
    className?: string
    description?: string
    disabled?: boolean
    error?: boolean
    label?: string
    name?: string
  } & InputHTMLAttributes<HTMLInputElement>,
  ref: Ref<HTMLInputElement>
) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div
        className={clsx("relative", "rounded-md", "flex", {
          "mt-1": !!label,
          "shadow-sm": error,
        })}
      >
        {addOn && (
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
            {addOn}
          </span>
        )}

        <input
          type={type}
          name={name}
          id={id}
          ref={ref}
          className={clsx("block", "w-full", "shadow-sm", "sm:text-sm", {
            "border-gray-300": !error,
            "border-gray-300 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500":
              disabled,
            "border-red-300": error,
            "focus:border-gray-500 focus:ring-gray-500": !error,
            "focus:border-red-500 focus:outline-none focus:ring-red-500": error,
            "pr-10": error,
            "rounded-md": !addOn,
            "rounded-r-md": addOn,
            "text-red-900 placeholder-red-300": error,
          })}
          placeholder={placeholder}
          aria-invalid={error}
          aria-describedby={error ? `${id}-error` : undefined}
          disabled={disabled}
          {...props}
        />
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        )}
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
    </div>
  )
}

export default forwardRef(Input)
