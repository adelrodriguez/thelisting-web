import { PhotoIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { useRef } from "react"
import { useControlField, useField } from "remix-validated-form"
import invariant from "tiny-invariant"

import { Button } from "~/components/common"

/**
 * This component should only be used within a Form component.
 */
export default function FormImageUpload({
  name,
  required,
  description,
  label,
  id = name,
}: {
  name: string
  label: string
  required?: boolean
  description?: string
  id?: string
}) {
  const { error } = useField(name)
  const [value, setValue] = useControlField<File>(name)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="mx-auto w-full max-w-7xl">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && (
            <span className="text-xs text-red-500" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
      )}
      <input
        accept="image/*"
        className="sr-only"
        id={id}
        name={name}
        onChange={(event) => {
          const file = event.target.files?.[0]
          invariant(file, "File is required")
          setValue(file)
        }}
        ref={inputRef}
        type="file"
      />
      <div className="group relative mx-auto mt-1 w-fit">
        {value && (
          <>
            <img
              src={
                typeof value === "string" ? value : URL.createObjectURL(value)
              }
              className="mx-auto max-h-64 rounded-sm shadow-lg group-hover:blur"
              alt=""
            />
            {value instanceof File && (
              <p className="mt-2 text-center text-xs text-gray-500">
                {value.name} - {value.size} bytes
              </p>
            )}
          </>
        )}
        <div
          className={clsx({
            "absolute top-1/2 left-1/2 hidden w-auto -translate-x-1/2 -translate-y-1/2 transform group-hover:block":
              value,
          })}
        >
          <Button
            onClick={(e) => {
              e.preventDefault()
              inputRef.current?.click()
            }}
          >
            <PhotoIcon className="mr-2 h-5 w-5" aria-hidden="true" />
            {value ? "Change" : "Upload"}
          </Button>
        </div>
      </div>
      {(description || error) && (
        <p
          className={clsx("mt-2 text-sm", {
            "text-gray-500": !error,
            "text-red-600": error,
          })}
          id={error ? `${id}-error` : `${id}-description`}
        >
          {error || description}
        </p>
      )}
    </div>
  )
}
