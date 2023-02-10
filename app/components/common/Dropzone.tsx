import { DocumentArrowDownIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import type { ReactElement } from "react"
import type { DropzoneOptions } from "react-dropzone"
import { useDropzone } from "react-dropzone"

import type { FileType } from "~/config/consts"

export default function Dropzone({
  maxFiles = 1,
  fileTypes,
  onDrop,
  icon = <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />,
  children,
}: {
  maxFiles?: number
  fileTypes: { [key in FileType]?: string[] }
  onDrop: DropzoneOptions["onDrop"]
  icon?: ReactElement
  children?: ReactElement | null
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: fileTypes,
    maxFiles,
    onDrop,
  })

  const acceptedFileType = Object.values(fileTypes).join(", ")

  return (
    <div className="mx-auto w-full max-w-7xl">
      <button
        type="button"
        className={clsx(
          "relative block w-full rounded-lg p-6 text-center transition-all hover:border-gray-400  focus:shadow-lg focus:outline-none",
          {
            "bg-gray-100 shadow-lg": isDragActive,
            "border-2 border-dashed border-gray-300": !isDragActive,
          }
        )}
        {...getRootProps()}
      >
        {children ? (
          children
        ) : (
          <div className="flex flex-col space-y-1 text-sm text-gray-600">
            {icon}

            <div className="mx-auto flex">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-medium text-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-500 focus-within:ring-offset-2 hover:text-gray-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  {...getInputProps()}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>

            <p className="text-xs text-gray-500">
              {acceptedFileType.replaceAll(".", "").toUpperCase()} up to 10MB
            </p>
          </div>
        )}
      </button>
    </div>
  )
}
