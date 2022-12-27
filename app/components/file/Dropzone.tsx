import {
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline"
import clsx from "clsx"
import type { ReactElement } from "react"
import type { DropzoneOptions } from "react-dropzone"
import { useDropzone } from "react-dropzone"

import type { FileTypes } from "~/config/consts"

export default function Dropzone({
  maxFiles = 1,
  fileTypes,
  onDrop,
}: {
  maxFiles?: number
  fileTypes: { [key in FileTypes]?: string[] }
  onDrop: DropzoneOptions["onDrop"]
}): ReactElement {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: fileTypes,
    maxFiles,
    onDrop,
  })

  const acceptedFileTypes = Object.values(fileTypes).join(", ")

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          className={clsx(
            "relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
            { "bg-gray-300": isDragActive }
          )}
          {...getRootProps()}
        >
          {isDragActive ? (
            <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
          ) : (
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          )}
          <input {...getInputProps()} />

          <span className="mt-2 block text-sm font-medium text-gray-900">
            {isDragActive
              ? "Drop the files here"
              : `Drag and drop your files, or click to select. Accepted file types: ${acceptedFileTypes}`}
          </span>
        </button>
      </div>
    </div>
  )
}
