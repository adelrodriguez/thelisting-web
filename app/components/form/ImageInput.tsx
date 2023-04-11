import { PhotoIcon, FolderOpenIcon } from "@heroicons/react/20/solid"
import type { Image } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import type { InputHTMLAttributes } from "react"
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
        <div className="mt-1 flex rounded-md shadow-sm">
          <div className="relative flex flex-grow items-stretch focus-within:z-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <PhotoIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              value={data?.filename}
              type="text"
              className="block w-full rounded-none rounded-l-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={placeholder}
              disabled
            />
            <input {...props} type="hidden" value={value} name={name} />
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
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </>
  )
}
