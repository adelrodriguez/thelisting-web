import { ExclamationCircleIcon } from "@heroicons/react/24/solid"
import clsx from "clsx"
import type { ComponentProps, Ref } from "react"
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
    trailing,
    required,
    ...props
  }: {
    addOn?: string
    className?: string
    description?: string
    disabled?: boolean
    error?: boolean
    label?: string
    name?: string
    trailing?: string
  } & ComponentProps<"input">,
  ref: Ref<HTMLInputElement>
) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700" htmlFor={id}>
          {label}
          {required && (
            <span aria-hidden="true" className="text-xs text-red-500">
              {" "}
              *
            </span>
          )}
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
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={error}
          className={clsx("block", "w-full", "shadow-sm", "sm:text-sm", {
            "border-gray-300": !error,
            "border-gray-300 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500":
              disabled,
            "border-red-300": error,
            "focus:border-gray-500 focus:ring-gray-500": !error,
            "focus:border-red-500 focus:outline-none focus:ring-red-500": error,
            "pr-10": error || trailing,
            "pr-16": error && trailing,
            "rounded-md": !addOn,
            "rounded-r-md": addOn,
            "text-red-900 placeholder-red-300": error,
          })}
          disabled={disabled}
          id={id}
          name={name}
          placeholder={placeholder}
          ref={ref}
          type={type}
          {...props}
        />
        {trailing && (
          <div
            className={clsx(
              "pointer-events-none absolute inset-y-0 right-0 flex items-center",
              {
                "pr-10": error,
                "pr-3": !error,
              }
            )}
          >
            <span className="text-gray-500 sm:text-sm">{trailing}</span>
          </div>
        )}

        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon
              aria-hidden="true"
              className="h-5 w-5 text-red-500"
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
