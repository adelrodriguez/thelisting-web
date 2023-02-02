import {
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline"
import clsx from "clsx"
import type { DropzoneOptions } from "react-dropzone"
import { useDropzone } from "react-dropzone"

import type { FileType } from "~/config/consts"

export default function Dropzone({
  maxFiles = 1,
  fileTypes,
  onDrop,
}: {
  maxFiles?: number
  fileTypes: { [key in FileType]?: string[] }
  onDrop: DropzoneOptions["onDrop"]
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: fileTypes,
    maxFiles,
    onDrop,
  })

  const acceptedFileType = Object.values(fileTypes).join(", ")

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          className={clsx(
            "relative block w-full rounded-lg bg-gray-100  p-12 text-center transition-all hover:border-gray-400 focus:shadow-lg focus:outline-none",
            { "shadow-inner": !isDragActive, "shadow-lg": isDragActive }
          )}
          {...getRootProps()}
        >
          {isDragActive ? (
            <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
          ) : (
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          )}
          <input {...getInputProps()} />

          <span className="mt-2 block text-sm font-medium text-gray-500">
            {isDragActive
              ? "Drop the files here"
              : `Drag and drop your files, or click to select. Accepted file types: ${acceptedFileType}`}
          </span>
        </button>
      </div>
    </div>
  )
}
