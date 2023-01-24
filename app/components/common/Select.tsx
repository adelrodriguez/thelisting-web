import { ExclamationCircleIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import type { OptionHTMLAttributes, Ref, SelectHTMLAttributes } from "react"
import { forwardRef } from "react"

type OptionValue = OptionHTMLAttributes<HTMLOptionElement>["value"]

export type SelectOption<T> = {
  label: string
  value: T
  disabled?: boolean
}

function Select<T extends OptionValue>(
  {
    className,
    description,
    disabled,
    error,
    label,
    name,
    id = name,
    options,
    placeholder,
    required,
    ...props
  }: {
    description?: string
    disabled?: boolean
    error?: boolean
    label?: string
    name?: string
    options: SelectOption<T>[]
    placeholder?: string
    required?: boolean
  } & SelectHTMLAttributes<HTMLSelectElement>,
  ref: Ref<HTMLSelectElement>
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
        <select
          {...props}
          name={name}
          id={id}
          ref={ref}
          className={clsx(
            "block",
            "w-full",
            "shadow-sm",
            "sm:text-sm",
            "rounded-md",
            {
              "border-gray-300": !error,
              "border-gray-300 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500":
                disabled,
              "border-red-300": error,
              "focus:border-gray-500 focus:ring-gray-500": !error,
              "focus:border-red-500 focus:outline-none focus:ring-red-500":
                error,
              "pr-10": error,
              "text-red-900 placeholder-red-300": error,
            }
          )}
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
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center pr-3">
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

export default forwardRef(Select)
