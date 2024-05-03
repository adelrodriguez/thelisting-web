import { Dialog, Transition } from "@headlessui/react"
import { PhotoIcon } from "@heroicons/react/24/outline"
import { useFetcher } from "@remix-run/react"
import { useQuery } from "@tanstack/react-query"
import type { FormEvent } from "react"
import { Fragment, useEffect, useState } from "react"
import { route } from "routes-gen"

import { Button, Dropzone, Input } from "~/components/common"
import { Spinner } from "~/components/loading"
import { IMAGE_MIME_TYPES } from "~/config/consts"
import { useUser } from "~/utils/hooks"

type UserImage = {
  id: string
  url: string
  name: string
}

export default function ImagePicker({
  onClose,
  onSelect,
  open,
}: {
  open: boolean
  onClose: () => void
  onSelect: (image: UserImage) => void
}) {
  const user = useUser()
  const { data, isError, isPending, refetch } = useQuery({
    queryFn: async () => {
      const res = await fetch(route("/api/users/:userId/images", { userId: user.id }))

      const data = await res.json()

      return data as UserImage[]
    },
    queryKey: ["images"],
  })

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
              <Dialog.Panel className="relative h-[80vh] w-full transform  rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:mx-2 sm:my-8 sm:max-w-7xl sm:p-6">
                {isPending && <div>Loading...</div>}
                {isError && <div>Error</div>}
                {data && step === "choose" && (
                  <ImageGallery images={data} onSelect={onSelect} onUpload={handleUpload} />
                )}
                {step === "upload" && file && (
                  <ImageSubmit file={file} onCancel={handleSubmitCancel} onSubmit={onSubmit} />
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
  onSelect,
  onUpload,
}: {
  images: UserImage[]
  onSelect: (image: UserImage) => void
  onUpload: (file: File) => void
}) {
  const [selected, setSelected] = useState<UserImage | null>(null)

  return (
    <div className="h-full">
      <Dialog.Title as="h3" className="text-xl">
        Choose an image
      </Dialog.Title>

      <div className="flex h-full flex-col gap-y-4 px-3 py-6">
        <div className="flex-1 overflow-auto p-4">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            <li>
              <Dropzone
                Icon={PhotoIcon}
                accept={IMAGE_MIME_TYPES}
                fileUploadLimitDescription="JPG, PNG, GIF and WEBP files up to 10MB"
                name="image-upload"
                onDrop={(files) => {
                  if (!files[0]) throw new Error("No file was uploaded")

                  onUpload(files[0])
                }}
                title="Upload an image"
              />
            </li>
            {images.map((image) => (
              <li className="relative" key={image.url}>
                <div className="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                  <img
                    alt=""
                    className="pointer-events-none object-cover group-hover:opacity-75"
                    loading="lazy"
                    src={image.url}
                  />
                  <button
                    className="absolute inset-0 focus:outline-none"
                    onClick={() => setSelected(image)}
                    type="button"
                  >
                    <span className="sr-only">View details for {image.name}</span>
                  </button>
                </div>
                <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                  {image.name}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end gap-x-2">
          <Button
            disabled={!selected}
            onClick={() => {
              if (!selected) return

              onSelect(selected)
            }}
            type="button"
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
    data.append("size", `${file.size}`)
    data.append("mimeType", file.type)
    data.append("filename", file.name)

    fetcher.submit(data, {
      action: route("/api/storage"),
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
        <fetcher.Form className="flex h-full flex-col gap-y-4 px-3 py-6" onSubmit={handleSubmit}>
          <div className="flex flex-1 items-center justify-center">
            <img alt="" className="max-h-96 w-auto" src={URL.createObjectURL(file)} />
          </div>
          <Input defaultValue={file.name} minLength={3} name="name" placeholder={file.name} />

          <div className="flex flex-row-reverse justify-start gap-x-2">
            <Button disabled={fetcher.state === "submitting"} type="submit">
              {fetcher.state === "submitting" && <Spinner className="mr-3 h-5 w-5" />}
              {fetcher.state === "submitting" ? "Uploading..." : "Upload"}
            </Button>
            <Button
              disabled={fetcher.state === "submitting"}
              onClick={onCancel}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  )
}
