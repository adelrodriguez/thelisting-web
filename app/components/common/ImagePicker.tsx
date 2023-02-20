import { Dialog, Transition } from "@headlessui/react"
import { PhotoIcon as PhotoIconOutline } from "@heroicons/react/24/outline"
import { PhotoIcon as PhotoIconSolid } from "@heroicons/react/24/solid"
import type { Image as UserImage } from "@prisma/client"
import { useFetcher } from "@remix-run/react"
import { useQuery } from "@tanstack/react-query"
import clsx from "clsx"
import type { FormEvent } from "react"
import { Fragment, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import invariant from "tiny-invariant"

import { Button, Image, Input } from "~/components/common"
import { Spinner } from "~/components/loading"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"

export default function ImagePicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (image: UserImage) => void
}) {
  const { data, isLoading, isError, refetch } = useQuery(["images"], () =>
    fetch("/api/user/images").then((res) => res.json() as Promise<UserImage[]>)
  )
  const [step, setStep] = useState<"choose" | "upload" | "name">("choose")
  const [file, setFile] = useState<File | null>(null)

  function handleUpload(uploadedFile: File) {
    setFile(uploadedFile)
    setStep("name")
  }

  function handleUploadCancel() {
    setFile(null)
    setStep("choose")
  }

  function handleSubmitCancel() {
    setFile(null)
    setStep("choose")
  }

  function onSubmit() {
    refetch()
    setStep("choose")
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative h-[80vh] w-full transform  rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:mx-2 sm:max-w-7xl sm:p-6">
                {isLoading && <div>Loading...</div>}
                {isError && <div>Error</div>}
                {data && step === "choose" && (
                  <ImageGallery
                    images={data}
                    onUploadClick={() => setStep("upload")}
                    onSelect={onSelect}
                  />
                )}
                {step === "upload" && (
                  <ImageUploader
                    onUpload={handleUpload}
                    onCancel={handleUploadCancel}
                  />
                )}
                {step === "name" && file && (
                  <ImageSubmit
                    file={file}
                    onCancel={handleSubmitCancel}
                    onSubmit={onSubmit}
                  />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

function ImageGallery({
  images,
  onUploadClick,
  onSelect,
}: {
  images: UserImage[]
  onUploadClick: () => void
  onSelect: (image: UserImage) => void
}) {
  const [selected, setSelected] = useState<UserImage | null>(null)

  return (
    <div className="h-full">
      <Dialog.Title as="h3" className="text-xl">
        Choose an image
      </Dialog.Title>

      <div className="flex h-full flex-col gap-y-4 py-6 px-3">
        <div className="overflow-auto p-4">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {images.map((image) => (
              <li key={image.id} className="relative">
                <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                  <Image
                    src={generateCloudflareImageUrl(image.id, "thumbnail")}
                    alt=""
                    className="pointer-events-none object-cover group-hover:opacity-75"
                  />
                  <button
                    type="button"
                    className="absolute inset-0 focus:outline-none"
                    onClick={() => setSelected(image)}
                  >
                    <span className="sr-only">
                      View details for {image.filename}
                    </span>
                  </button>
                </div>
                <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                  {image.filename}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end gap-x-2">
          <Button onClick={onUploadClick} variant="secondary">
            <PhotoIconSolid className="mr-2 h-5 w-5" />
            Upload
          </Button>
          <Button
            onClick={() => {
              invariant(selected, "No image was selected")
              onSelect(selected)
            }}
            disabled={!selected}
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  )
}

function ImageUploader({
  onUpload,
  onCancel,
}: {
  onUpload: (file: File) => void
  onCancel: () => void
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/gif": [".gif"],
      "image/jpg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    onDrop: (files) => {
      invariant(files[0], "No file was uploaded")

      onUpload(files[0])
    },
  })

  return (
    <div className="h-full">
      <div className="flex justify-between">
        <Dialog.Title as="h3" className="text-xl">
          Upload an image
        </Dialog.Title>
      </div>

      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-y-4 py-6 px-3">
        <button
          {...getRootProps({
            className: clsx(
              "flex-1 relative block w-full rounded-lg p-6 text-center transition-all hover:border-gray-400  focus:shadow-lg focus:outline-none",
              {
                "bg-gray-100 shadow-lg": isDragActive,
                "border-2 border-dashed border-gray-300": !isDragActive,
              }
            ),
            type: "button",
          })}
        >
          <div className="flex flex-col space-y-1 text-sm text-gray-600">
            <PhotoIconOutline className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mx-auto flex">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md  font-medium text-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-500 focus-within:ring-offset-2 hover:text-gray-500"
              >
                Upload a file
              </label>
              <input
                {...getInputProps({
                  className: "sr-only",
                  id: "image-upload",
                  name: "image-upload",
                  type: "file",
                })}
              />
              <p className="pl-1">or drag and drop</p>
            </div>

            <p className="text-xs text-gray-500">
              JPG, PNG and GIF files up to 10MB
            </p>
          </div>
        </button>
        <div className="w-full">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

function ImageSubmit({
  file,
  onCancel,
  onSubmit,
}: {
  file: File
  onCancel: () => void
  onSubmit: () => void
}) {
  const fetcher = useFetcher()

  useEffect(() => {
    if (!fetcher.data) return

    onSubmit()
  }, [fetcher.data, onSubmit])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    data.append("file", file)

    fetcher.submit(data, {
      action: "/api/user/images",
      encType: "multipart/form-data",
      method: "post",
    })
  }

  return (
    <div className="h-full">
      <div className="flex justify-between">
        <Dialog.Title as="h3" className="text-xl">
          Name the image
        </Dialog.Title>
      </div>

      <div className="h-full">
        <fetcher.Form
          className="flex h-full flex-col gap-y-4 py-6 px-3"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-1 items-center justify-center">
            <img
              alt=""
              src={URL.createObjectURL(file)}
              className="max-h-96 w-auto"
            />
          </div>
          <Input
            name="filename"
            placeholder={file.name}
            defaultValue={file.name}
            minLength={3}
          />

          <div className="flex justify-end gap-x-2">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={fetcher.state === "submitting"}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={fetcher.state === "submitting"}>
              {fetcher.state === "submitting" && (
                <Spinner className="mr-3 h-5 w-5" />
              )}
              {fetcher.state === "submitting" ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  )
}
