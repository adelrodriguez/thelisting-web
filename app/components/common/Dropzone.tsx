import { DocumentArrowDownIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import type { ComponentType } from "react"
import { type Accept, useDropzone } from "react-dropzone"

export default function Dropzone({
  Icon = DocumentArrowDownIcon,
  accept,
  fileUploadLimitDescription,
  maxFiles = 1,
  name,
  onDrop,
  title = "Choose a file",
}: {
  Icon?: ComponentType<{ className?: string }>
  accept: Accept
  fileUploadLimitDescription: string
  maxFiles?: number
  name: string
  onDrop?: (files: File[]) => void
  title?: string
}) {
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    onDrop: (files) => {
      if (!files[0]) {
        throw new Error("You must provide a file")
      }

      if (!onDrop) return

      onDrop(files)
    },
  })

  return (
    <div className="mx-auto h-full w-full max-w-7xl">
      <button
        {...getRootProps({
          className: clsx(
            "relative block h-full w-full rounded-lg p-6 text-center transition-all hover:border-gray-400  focus:shadow-lg focus:outline-none",
            {
              "bg-gray-100 shadow-lg": isDragActive,
              "border-2 border-dashed border-gray-300": !isDragActive,
            },
          ),
          type: "button",
        })}
      >
        <div className="flex flex-col text-gray-600">
          <Icon className="mx-auto mb-1 h-12 w-12 text-gray-400" />
          <div className="mx-auto mb-2 flex flex-col">
            <label
              className="relative cursor-pointer rounded-md font-medium text-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-500 focus-within:ring-offset-2 hover:text-gray-500"
              htmlFor="file-upload"
            >
              {title}
            </label>
            <input
              {...getInputProps({
                className: "sr-only",
                id: name,
                name,
                type: "file",
              })}
            />
            <p className="text-sm">or drag and drop</p>
          </div>

          <p className="text-xs text-gray-500">{fileUploadLimitDescription}</p>
        </div>
      </button>
    </div>
  )
}
