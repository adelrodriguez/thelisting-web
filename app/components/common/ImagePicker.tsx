import { Dialog, Transition } from "@headlessui/react"
import { PhotoIcon } from "@heroicons/react/24/outline"
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
  const { data, isLoading, isError, refetch } = useQuery(
    ["images"],
    async () => {
      const res = await fetch("/api/images")
      const data = await res.json()
      // TODO(adelrodriguez): Fix this type
      return data as UserImage[]
    }
  )

  const [step, setStep] = useState<"choose" | "upload">("choose")
  const [file, setFile] = useState<File | null>(null)

  function handleUpload(uploadedFile: File) {
    setFile(uploadedFile)
    setStep("upload")
  }

  function handleSubmitCancel() {
    setFile(null)
    setStep("choose")
  }

  function onSubmit() {
    void refetch()
    setStep("choose")
  }

  return (
    <Transition.Root as={Fragment} show={open}>
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
                    onSelect={onSelect}
                    onUpload={handleUpload}
                  />
                )}
                {step === "upload" && file && (
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
  onUpload,
  onSelect,
}: {
  images: UserImage[]
  onSelect: (image: UserImage) => void
  onUpload: (file: File) => void
}) {
  const [selected, setSelected] = useState<UserImage | null>(null)
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
      <Dialog.Title as="h3" className="text-xl">
        Choose an image
      </Dialog.Title>

      <div className="flex h-full flex-col gap-y-4 py-6 px-3">
        <div className="flex-1 overflow-auto p-4">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            <li className="h-full">
              <button
                {...getRootProps({
                  className: clsx(
                    "flex-1 relative block w-full rounded-lg p-6 md:py-11 text-center transition-all hover:border-gray-400  focus:shadow-lg focus:outline-none",
                    {
                      "bg-gray-100 shadow-lg": isDragActive,
                      "border-2 border-dashed border-gray-300": !isDragActive,
                    }
                  ),
                  type: "button",
                })}
              >
                <div className="flex flex-col space-y-1 text-sm text-gray-600">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mx-auto flex flex-col">
                    <label
                      className="relative cursor-pointer rounded-md  font-medium text-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-500 focus-within:ring-offset-2 hover:text-gray-500"
                      htmlFor="file-upload"
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
            </li>
            {images.map((image) => (
              <li className="relative" key={image.id}>
                <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                  <Image
                    alt=""
                    className="pointer-events-none object-cover group-hover:opacity-75"
                    src={generateCloudflareImageUrl(image.id, "thumbnail")}
                  />
                  <button
                    className="absolute inset-0 focus:outline-none"
                    onClick={() => setSelected(image)}
                    type="button"
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
          <Button
            disabled={!selected}
            onClick={() => {
              invariant(selected, "No image was selected")
              onSelect(selected)
            }}
          >
            Select
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
    e.stopPropagation()
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    data.append("file", file)

    fetcher.submit(data, {
      action: "/api/images",
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
              className="max-h-96 w-auto"
              src={URL.createObjectURL(file)}
            />
          </div>
          <Input
            defaultValue={file.name}
            minLength={3}
            name="filename"
            placeholder={file.name}
          />

          <div className="flex justify-end gap-x-2">
            <Button
              disabled={fetcher.state === "submitting"}
              onClick={onCancel}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button disabled={fetcher.state === "submitting"} type="submit">
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
