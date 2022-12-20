import { ExclamationCircleIcon } from "@heroicons/react/24/solid"
import classNames from "classnames"
import type { InputHTMLAttributes, ReactElement, Ref } from "react"
import { forwardRef } from "react"

function Input(
  {
    className,
    description,
    disabled = false,
    error = false,
    id,
    label,
    name,
    placeholder,
    type = "text",
    ...props
  }: {
    className?: string
    description?: string
    label?: string
    name?: string
    error?: boolean
    disabled?: boolean
  } & InputHTMLAttributes<HTMLInputElement>,
  ref: Ref<HTMLInputElement>
): ReactElement {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div
        className={classNames("relative", "rounded-md", {
          "mt-1": !!label,
          "shadow-sm": error,
        })}
      >
        <input
          type={type}
          name={name}
          id={id}
          ref={ref}
          className={classNames(
            "block",
            "w-full",
            "rounded-md",
            "shadow-sm",
            "sm:text-sm",
            {
              "border-gray-300": !error,
              "border-gray-300 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500":
                disabled,
              "border-red-300": error,
              "focus:border-indigo-500 focus:ring-indigo-500": !error,
              "focus:border-red-500 focus:outline-none focus:ring-red-500":
                error,
              "pr-10": error,
              "text-red-900 placeholder-red-300": error,
            }
          )}
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
          className={classNames("mt-2 text-sm", {
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
