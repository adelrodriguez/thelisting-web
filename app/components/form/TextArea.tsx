import { ExclamationCircleIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { useEffect, useRef } from "react"
import type { ComponentPropsWithoutRef } from "react"
import { useField } from "remix-validated-form"

/**
 * This component should only be used within a Form component.
 */
export default function TextArea({
  name,
  label,
  className,
  description,
  required,
  ...props
}: {
  name: string
  label: string
  description?: string
} & ComponentPropsWithoutRef<"textarea">) {
  const { getInputProps, error } = useField(name)
  const $input = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    $input.current?.setCustomValidity(error || "")
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
        <textarea
          {...getInputProps({ ...props, id: name, ref: $input })}
          className={clsx(
            "peer my-1 block w-full rounded-md border-gray-300 py-1.5 shadow-sm sm:text-sm sm:leading-6",
            "focus:border-gray-500 focus:ring-gray-500",
            "disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500",
            "invalid:border-red-300 invalid:pr-10 invalid:text-red-900 invalid:placeholder-red-300 invalid:focus:border-red-500 invalid:focus:outline-none invalid:focus:ring-red-500",
          )}
        />
        <div className="pointer-events-none invisible absolute right-0 top-0 flex translate-y-1/2 items-center pr-3 peer-invalid:visible">
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
