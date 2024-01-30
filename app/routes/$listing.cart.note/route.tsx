import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { NoteType } from "@prisma/client"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { StatusCodes } from "http-status-codes"
import { Fragment, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { setFormDefaults } from "remix-validated-form"
import SuperJSON from "superjson"
import { z } from "zod"
import { zfd } from "zod-form-data"
import { zx } from "zodix"

import { Alert, Button } from "~/components/common"
import { Form, SubmitButton, TextArea } from "~/components/form"
import { getSession } from "~/helpers/session.server"
import Sentry from "~/services/sentry"
import { useCart, useDialogPage } from "~/utils/hooks"
import { generateKey } from "~/utils/redis"
import type { RouteHandle } from "~/utils/remix"

export const handle: RouteHandle = {
  i18n: ["registry", "common"],
  id: "listing-cart-note",
}

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const db = context.db
  const cache = context.cache

  try {
    const { listing: listingPath } = zx.parseParams(
      params,
      z.object({ listing: z.string() }),
    )

    const { id: listingId } = await db.listing.findFirstOrThrow({
      where: { path: listingPath },
    })

    const session = await getSession(request.headers.get("cookie"))
    const cartId = session.get("cartsKey")

    if (!cartId) {
      throw new Error("No cart ID found")
    }

    const cart = await cache.get(generateKey("cart", cartId, listingId))

    if (!cart) {
      throw new Error("No cart found")
    }

    const { noteId } = SuperJSON.parse<{ noteId: string | null }>(cart)

    if (!noteId) {
      return json({ note: null })
    }

    const note = await db.note.findUnique({
      where: { id: noteId },
    })

    return json({
      note,
      ...setFormDefaults("add-note", {
        id: note?.id ?? "",
        text: note?.text ?? "",
      }),
    })
  } catch (error) {
    Sentry.captureException(error)

    return json({ note: null })
  }
}

export async function action({ context, params, request }: ActionFunctionArgs) {
  const db = context.db

  const { listing: listingPath } = zx.parseParams(
    params,
    z.object({ listing: z.string() }),
  )

  const serverValidator = withZod(
    z.object({
      id: z.string().optional(),
      text: zfd.text(z.string().max(500, "The note is too long").optional()),
    }),
  )

  const formData = await request.formData()
  const result = await serverValidator.validate(formData)

  if (result.error) {
    return json(
      {
        note: null,
        success: false,
        ...result.error,
      },
      { status: StatusCodes.UNPROCESSABLE_ENTITY },
    )
  }

  if (!result.data.id && result.data.text) {
    const listing = await db.listing.findUniqueOrThrow({
      select: { id: true },
      where: { path: listingPath },
    })

    const note = await db.note.create({
      data: {
        listingId: listing.id,
        text: result.data.text,
        type: NoteType.Text,
      },
    })

    return json({ note, success: true })
  }

  if (!result.data.text) {
    await db.note.delete({
      where: { id: result.data.id },
    })

    return json({ note: null, success: true })
  }

  const note = await db.note.update({
    data: { text: result.data.text, type: NoteType.Text },
    where: { id: result.data.id },
  })

  return json({ note, success: true })
}

export default function Page() {
  const { note } = useLoaderData<typeof loader>()
  const { close, leave, open } = useDialogPage()

  const { t } = useTranslation(handle.i18n)
  const cart = useCart()
  const actionData = useActionData<typeof action>()
  const lengthError = t("registry:note.lengthError")
  const clientValidator = withZod(
    z.object({
      text: zfd.text(z.string().max(500, lengthError).optional()),
    }),
  )

  useEffect(() => {
    if (!actionData) return

    if (!actionData.success) return

    cart.attachNoteId(actionData.note === null ? null : actionData.note.id)

    close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData, close])

  return (
    <Transition.Root appear as={Fragment} show={open}>
      <Dialog as="div" className="relative z-30" onClose={close}>
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                afterLeave={leave}
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <Form
                    className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl"
                    id="add-note"
                    method="POST"
                    validator={clientValidator}
                  >
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="bg-gray-700 px-4 py-6 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-lg font-medium text-white">
                            {t("note.title")}
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              className="rounded-md bg-gray-700 text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                              onClick={close}
                              type="button"
                            >
                              <span className="sr-only">{t("close")}</span>
                              <XMarkIcon
                                aria-hidden="true"
                                className="h-6 w-6"
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
                          <div className="space-y-6 pb-5 pt-6">
                            <input
                              defaultValue={note?.id || ""}
                              name="id"
                              type="hidden"
                            />
                            <TextArea
                              defaultValue={note?.text || ""}
                              label="Nota"
                              name="text"
                              placeholder={`${t("note.placeholder")}`}
                              rows={20}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end gap-4 px-4 py-4">
                      <Button onClick={close} type="button" variant="secondary">
                        {t("common:cancel")}
                      </Button>
                      <SubmitButton loadingText={`${t("common:saving")}`}>{`${t(
                        "common:save",
                      )}`}</SubmitButton>
                    </div>
                  </Form>
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
    <div className="mb-2 mt-4">
      {/* TODO(adelrodriguez): Replace with route() */}
      <Alert onClose={() => navigate("../")} type="error">
        There was an error saving your note. Please try again.
      </Alert>
    </div>
  )
}
