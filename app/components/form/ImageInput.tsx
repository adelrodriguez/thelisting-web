import { PhotoIcon, FolderOpenIcon } from "@heroicons/react/20/solid"
import type { Image } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import clsx from "clsx"
import type { FocusEvent, InputHTMLAttributes } from "react"
import { useState } from "react"
import type { z } from "zod"

import { ImagePicker } from "~/components/common"

export default function ImageInput({
  className,
  description,
  label,
  required,
  schema,
  defaultValue,
  ...props
}: {
  label: string
  description?: string
  /**
   * The Zod schema used to validate the input client-side
   */
  schema?: z.ZodSchema
} & InputHTMLAttributes<HTMLInputElement>) {
  const { name, placeholder } = props
  const [validationError, setValidationError] = useState("")

  const [value, setValue] = useState(defaultValue || "")
  const [open, setOpen] = useState(false)
  const { data } = useQuery(
    ["images", value],
    async () => {
      const res = await fetch(`/api/images/${value}`)
      const data = await res.json()

      return data as Image
    },
    {
      enabled: !!value,
    }
  )

  function validate(event: FocusEvent<HTMLInputElement>) {
    const $input = event.currentTarget

    if (!schema) return

    const result = schema.safeParse($input.value)

    setValidationError(
      result.success ? "" : result.error.flatten().formErrors[0]!
    )
  }

  return (
    <>
      <ImagePicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(file) => {
          setValue(file.id)
          setOpen(false)
        }}
      />
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
        <div className="group my-1 flex rounded-md shadow-sm">
          <div className="relative flex flex-grow items-stretch focus-within:z-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <PhotoIcon
                className={clsx(
                  "h-5 w-5",
                  validationError ? "text-red-400" : "text-gray-400"
                )}
                aria-hidden="true"
              />
            </div>
            <input
              value={data?.filename || ""}
              type={props.type || "text"}
              className={clsx(
                "block w-full select-none rounded-none rounded-l-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ",
                "focus:ring-2 focus:ring-inset",
                "sm:text-sm sm:leading-6",
                {
                  "placeholder-gray-400 ring-gray-300 focus:ring-slate-600":
                    !validationError,
                  "pr-10 text-red-900 placeholder-red-300 ring-red-300 focus:outline-none focus:ring-red-500":
                    validationError,
                }
              )}
              readOnly
              placeholder={placeholder}
              onBlur={validate}
            />
            <input {...props} type="hidden" value={value} name={name} />
          </div>
          <button
            type="button"
            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={() => setOpen(true)}
          >
            <FolderOpenIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
            Select
          </button>
        </div>
        {description && (
          <p
            className={clsx("text-sm text-gray-500", {
              block: !validationError,
              hidden: validationError,
            })}
          >
            {description}
          </p>
        )}
        <p
          className={clsx("text-sm text-red-600", {
            block: validationError,
            hidden: !validationError,
          })}
        >
          {validationError}
        </p>
      </div>
    </>
  )
}
