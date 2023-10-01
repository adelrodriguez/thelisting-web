import { ExclamationCircleIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import type { ComponentProps, Ref } from "react"
import { forwardRef } from "react"

type SelectOption = {
  label: string
  value: ComponentProps<"option">["value"]
  disabled?: boolean
}

function Select<T extends SelectOption>(
  {
    className,
    description,
    disabled,
    error,
    label,
    name,
    id = name,
    options,
    required,
    ...props
  }: {
    description?: string
    disabled?: boolean
    error?: boolean
    label?: string
    name?: string
    options: T[]
    required?: boolean
  } & ComponentProps<"select">,
  ref: Ref<HTMLSelectElement>,
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
        <select
          {...props}
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
            },
          )}
          id={id}
          name={name}
          ref={ref}
        >
          {options.map((option) => (
            <option
              disabled={option.disabled}
              key={`${option.value}`}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center pr-3">
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

export default forwardRef(Select)
