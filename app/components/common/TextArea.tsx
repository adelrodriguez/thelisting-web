import clsx from "clsx"
import type { ComponentProps, Ref } from "react"
import { forwardRef } from "react"

function TextArea(
  {
    label,
    name,
    rows = 4,
    id = name,
    description,
    error = false,
    required,
    ...props
  }: {
    name?: string
    description?: string
    label?: string
    error?: boolean
  } & ComponentProps<"textarea">,
  ref: Ref<HTMLTextAreaElement>,
) {
  return (
    <div>
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

      <div className="mt-1">
        <textarea
          {...props}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          id={id}
          name={name}
          ref={ref}
          rows={rows}
        />
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

export default forwardRef(TextArea)
