import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { NoteType } from "@prisma/client"
import type { ActionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useFetcher, useNavigate } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { Fragment, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  setFormDefaults,
  ValidatedForm,
  validationError,
} from "remix-validated-form"
import { z } from "zod"

import { Alert, Button } from "~/components/common"
import { FormSubmit, FormTextArea } from "~/components/form"
import prisma from "~/helpers/prisma.server"
import { useCart } from "~/utils/hooks"
import { getFormData, NotFound } from "~/utils/http.server"

export const handle = {
  i18n: ["listing", "common"],
}

const CartNoteSchema = z.object({
  text: z.string().max(500),
})

const validator = withZod(CartNoteSchema)

export async function loader({ request }: ActionArgs) {
  const requestUrl = new URL(request.url)
  const noteId = requestUrl.searchParams.get("note_id")

  if (!noteId) return null

  const note = await prisma.note.findUnique({
    select: { text: true },
    where: { id: noteId },
  })

  if (!note) return null

  return json(setFormDefaults("noteForm", { text: note.text! }))
}

export async function action({ request, params }: ActionArgs) {
  const requestUrl = new URL(request.url)
  const listingPath = params.listing
  const noteId = requestUrl.searchParams.get("note_id")

  const formData = await getFormData(request)
  const result = await validator.validate(formData)

  if (result.error) return validationError(result.error)

  if (noteId) {
    const note = await prisma.note.update({
      data: { text: result.data.text, type: NoteType.Text },
      where: { id: noteId },
    })

    return note
  } else if (listingPath) {
    const listing = await prisma.listing.findUnique({
      select: { id: true },
      where: { path: listingPath },
    })

    if (!listing) throw NotFound

    const note = await prisma.note.create({
      data: {
        listingId: listing.id,
        text: result.data.text,
        type: NoteType.Text,
      },
    })

    return note
  }
}

export default function NotePage() {
  const [open, setOpen] = useState(true)
  const navigate = useNavigate()
  const { t } = useTranslation(handle.i18n)
  const fetcher = useFetcher<typeof action>()
  const cart = useCart()

  useEffect(() => {
    if (fetcher.data?.type === NoteType.Text) {
      cart.attachNoteId(fetcher.data.id)
      setOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data?.type])

  return (
    <Transition.Root appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={setOpen}>
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
                afterLeave={() => navigate("../", { preventScrollReset: true })}
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <ValidatedForm
                    className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl"
                    method="post"
                    validator={validator}
                    id="noteForm"
                    fetcher={fetcher}
                  >
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="bg-gray-700 py-6 px-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-lg font-medium text-white">
                            {t("note.title")}
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-gray-700 text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                              onClick={() => setOpen(false)}
                            >
                              <span className="sr-only">
                                {t("Close panel")}
                              </span>
                              <XMarkIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-300">
                            {t("note.subtitle")}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="divide-y divide-gray-200 px-4 sm:px-6">
                          <div className="space-y-6 pt-6 pb-5">
                            <FormTextArea
                              label="Nota"
                              name="text"
                              rows={20}
                              placeholder={`${t("note.placeholder")}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end gap-4 px-4 py-4">
                      <Button
                        variant="secondary"
                        onClick={() => setOpen(false)}
                      >
                        {t("common:cancel")}
                      </Button>
                      <FormSubmit
                        text={`${t("common:save")}`}
                        loadingText={`${t("common:saving")}`}
                      />
                    </div>
                  </ValidatedForm>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export function ErrorBoundary() {
  const navigate = useNavigate()
  const cart = useCart()

  useEffect(() => {
    // Since this probably happened due to the note being deleted, we'll clear
    // it from the cart.
    cart.attachNoteId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mt-4 mb-2">
      <Alert onClose={() => navigate("../")} type="error">
        There was an error saving your note. Please try again.
      </Alert>
    </div>
  )
}
