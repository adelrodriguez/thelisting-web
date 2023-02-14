import { PhotoIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { useRef } from "react"
import { useControlField, useField } from "remix-validated-form"
import invariant from "tiny-invariant"

import { Button } from "../common"

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
  const { error, getInputProps } = useField(name)
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
        {...getInputProps({
          accept: [".jpeg", ".jpg", ".png", ".gif"].join(", "),
          className: "sr-only",
          onChange: (event) => {
            const file = event.target.files?.[0]
            invariant(file, "File is required")
            setValue(file)
          },
          type: "file",
        })}
        ref={inputRef}
      />

      <div className="mt-1">
        {value && (
          <div className="p-8 text-sm shadow-md">
            <img
              src={
                typeof value === "string" ? value : URL.createObjectURL(value)
              }
              className="mx-auto max-h-64"
              alt=""
            />
          </div>
        )}
        <Button
          onClick={(e) => {
            e.preventDefault()
            inputRef.current?.click()
          }}
          className={clsx({
            "mt-2": value,
          })}
        >
          <PhotoIcon className="mr-2 h-5 w-5" aria-hidden="true" />
          Choose an image
        </Button>
      </div>

      {description ||
        (error && (
          <p
            className={clsx("mt-2 text-sm", {
              "text-gray-500": !error,
              "text-red-600": error,
            })}
            id={error ? `${id}-error` : `${id}-description`}
          >
            {error || description}
          </p>
        ))}
    </div>
  )
}
