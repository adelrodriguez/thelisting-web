import { PhotoIcon, FolderOpenIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { CameraIcon } from "@heroicons/react/24/solid"
import clsx from "clsx"
import { useEffect, useRef, useState, type ComponentProps } from "react"
import { useControlField, useField } from "remix-validated-form"

import { ImagePicker } from "~/components/common"
import type { Input } from "~/components/form"

/**
 * This component should only be used within a Form component.
 */
export default function ImageInput({
  className,
  description,
  label,
  name,
  placeholder,
  previewHeight = "h-80",
  required,
  ...props
}: ComponentProps<typeof Input> & { previewHeight?: string }) {
  const { error, getInputProps } = useField(name)
  const [value, setValue] = useControlField<string | null>(name)
  const $input = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (error) {
      $input.current?.setCustomValidity(error)
    }
  }, [error])

  return (
    <>
      <ImagePicker
        onClose={() => setOpen(false)}
        onSelect={(file) => {
          setValue(file.url)
          setOpen(false)
        }}
        open={open}
      />
      <div className={clsx("flex flex-col gap-y-1", className)}>
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

        <button
          className={clsx(
            "flex w-full items-center justify-center rounded-md border border-slate-200 bg-gray-100",
            previewHeight,
          )}
          onClick={() => setOpen(true)}
          type="button"
        >
          {value ? (
            <img
              className="h-full w-full rounded-md border border-slate-200 object-cover"
              loading="lazy"
              src={value}
            />
          ) : (
            <CameraIcon
              aria-hidden="true"
              className="h-20 w-20 text-gray-400"
            />
          )}
        </button>
        <div className="group my-1 flex rounded-md shadow-sm">
          <div className="relative flex flex-grow items-stretch focus-within:z-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <PhotoIcon
                aria-hidden="true"
                className={clsx(
                  "h-5 w-5",
                  error ? "text-red-400" : "text-gray-400",
                )}
              />
            </div>
            <input
              className={clsx(
                "block w-full select-none rounded-none rounded-l-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ",
                "focus:ring-2 focus:ring-inset",
                "sm:text-sm sm:leading-6",
                {
                  "placeholder-gray-400 ring-gray-300 focus:ring-slate-600":
                    !error,
                  "pr-10 text-red-900 placeholder-red-300 ring-red-300 focus:outline-none focus:ring-red-500":
                    error,
                },
              )}
              placeholder={placeholder}
              readOnly
              type={props.type || "text"}
              value={value || ""}
            />
            <input
              {...getInputProps({
                ...props,
                type: "hidden",
                value: value || "",
              })}
            />
          </div>

          <button
            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={() => {
              value ? setValue(null) : setOpen(true)
            }}
            type="button"
          >
            {value ? (
              <>
                <XMarkIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-gray-400"
                />
                Remove
              </>
            ) : (
              <>
                <FolderOpenIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-gray-400"
                />
                Select
              </>
            )}
          </button>
        </div>
        {description && (
          <p
            className={clsx("text-sm text-gray-500", {
              block: !error,
              hidden: error,
            })}
          >
            {description}
          </p>
        )}
        <p
          className={clsx("text-sm text-red-600", {
            block: error,
            hidden: !error,
          })}
        >
          {error}
        </p>
      </div>
    </>
  )
}
