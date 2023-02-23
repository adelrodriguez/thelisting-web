import { PhotoIcon, FolderOpenIcon } from "@heroicons/react/20/solid"
import type { Image } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import clsx from "clsx"
import { useState } from "react"
import { useControlField, useField } from "remix-validated-form"

import { ImagePicker } from "~/components/common"

/**
 * This component should only be used within a Form component.
 */
export default function FormImageInput({
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
  const [value, setValue] = useControlField<string | null>(name)
  const [open, setOpen] = useState(false)
  const { data } = useQuery<Image>(
    ["images", value],
    () => fetch(`/api/images/${value}`).then((res) => res.json()),
    {
      enabled: !!value,
    }
  )

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
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <div className="relative flex flex-grow items-stretch focus-within:z-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <PhotoIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              value={data?.filename || ""}
              type="text"
              className="block w-full rounded-none rounded-l-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Choose an image"
              disabled
            />
            <input
              {...getInputProps({
                required,
                type: "hidden",
                value: value || "",
              })}
            />
          </div>
          <button
            type="button"
            className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            onClick={() => setOpen(true)}
          >
            <FolderOpenIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
            <span>Select</span>
          </button>
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
    </>
  )
}
