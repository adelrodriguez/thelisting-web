import { ExclamationCircleIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { useEffect, useRef } from "react"
import type { ComponentPropsWithoutRef } from "react"
import { useField } from "remix-validated-form"

/**
 * This component should only be used within a Form component.
 */
export default function Input({
  className,
  description,
  label,
  name,
  required,
  trailing,
  type = "text",
  ...props
}: {
  name: string
  label: string
  description?: string
  trailing?: string
} & Omit<
  ComponentPropsWithoutRef<"input">,
  "name" | "defaultValue" | "defaultChecked"
>) {
  const { error, getInputProps } = useField(name)
  const $input = useRef<HTMLInputElement>(null)

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
        <input
          {...getInputProps({
            ...props,
            id: name,
            ref: $input,
            type,
            ...(description
              ? { "aria-describedby": `${name}-description` }
              : {}),
          })}
          className={clsx(
            "peer my-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-slate-300",
            "placeholder:text-gray-400",
            "sm:text-sm sm:leading-6",
            "focus:ring-2 focus:ring-inset focus:ring-slate-600",
            "disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500",
            "invalid:pr-10 invalid:text-red-900 invalid:placeholder-red-300 invalid:ring-red-300 invalid:focus:outline-none invalid:focus:ring-red-500",
            {
              "h-9": type === "color",
              "pr-10 invalid:pr-16": trailing,
            },
          )}
        />
        {trailing && (
          <div className="pointer-events-none absolute right-0 top-0 flex h-9 items-center pr-3 peer-invalid:pr-10">
            <span className="text-gray-500 sm:text-sm">{trailing}</span>
          </div>
        )}
        <div className="pointer-events-none invisible absolute right-0 top-0 flex h-9 items-center pr-3 peer-invalid:visible">
          <ExclamationCircleIcon
            aria-hidden="true"
            className="h-5 w-5 text-red-500"
          />
        </div>
        {description && (
          <p
            className="text-sm text-gray-500 peer-invalid:hidden"
            id={`${name}-description`}
          >
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
