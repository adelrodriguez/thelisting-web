import clsx from "clsx"
import type { ReactElement, Ref, TextareaHTMLAttributes } from "react"
import { forwardRef } from "react"

function TextArea(
  {
    defaultValue,
    label,
    name,
    rows = 4,
    id = name,
    description,
    error = false,
    ...props
  }: {
    name?: string
    description?: string
    defaultValue?: string
    label?: string
    error?: boolean
  } & TextareaHTMLAttributes<HTMLTextAreaElement>,
  ref: Ref<HTMLTextAreaElement>
): ReactElement {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="mt-1">
        <textarea
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          defaultValue={defaultValue}
          id={id}
          name={name}
          ref={ref}
          rows={rows}
          {...props}
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
