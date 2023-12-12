import { ExclamationCircleIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import type { ComponentPropsWithoutRef } from "react"
import { useRef, useEffect } from "react"
import { useField } from "remix-validated-form"

type SelectOption = {
  label: string
  value: ComponentPropsWithoutRef<"option">["value"]
  disabled?: boolean
}

/**
 * This component should only be used within a Form component.
 */
export default function Select<T extends SelectOption>({
  name,
  className,
  description,
  label,
  options,
  required,
  ...props
}: {
  name: string
  label: string
  description?: string
  error?: boolean
  options: T[]
  placeholder?: string
} & Omit<ComponentPropsWithoutRef<"select">, "name" | "defaultValue">) {
  const { error, getInputProps } = useField(name)
  const $select = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    $select.current?.setCustomValidity(error || "")
  }, [error])

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
          {...getInputProps({ ...props, id: name, ref: $select })}
          className={clsx(
            "peer my-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-slate-300",
            "placeholder:text-gray-400",
            "sm:text-sm sm:leading-6",
            "focus:ring-2 focus:ring-inset focus:ring-slate-600",
            "disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500",
            "invalid:pr-10 invalid:text-red-900 invalid:placeholder-red-300 invalid:ring-red-300 invalid:focus:outline-none invalid:focus:ring-red-500",
          )}
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
        <div className="pointer-events-none invisible absolute right-7 top-0 flex h-9 items-center peer-invalid:visible">
          <ExclamationCircleIcon
            aria-hidden="true"
            className="h-5 w-5 text-red-500"
          />
        </div>
        {description && (
          <p className="text-sm text-gray-500 peer-invalid:hidden">
            {description}
          </p>
        )}
        <p className="hidden text-sm text-red-600 peer-invalid:block">
          {error}
        </p>
      </div>
    </div>
  )
}
