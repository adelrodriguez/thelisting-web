import { Dialog, Transition } from "@headlessui/react"
import { UserRole, RibbonType } from "@prisma/client"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { Fragment, useEffect } from "react"
import { namedAction } from "remix-utils"
import { ValidatedForm } from "remix-validated-form"
import { z } from "zod"
import { zx } from "zodix"

import { Button } from "~/components/common"
import { Input } from "~/components/form"
import { Spinner } from "~/components/loading"
import auth from "~/helpers/auth.server"
import { useDialogPage } from "~/utils/hooks"
import { notFound, unauthorized } from "~/utils/remix"
import {
  RibbonNameSchema,
  BannerPropertiesSchema,
  CountdownPropertiesSchema,
  CoverImagePropertiesSchema,
  ImageCarouselPropertiesSchema,
  ImageGalleryPropertiesSchema,
  TextPropertiesSchema,
} from "~/utils/ribbons"

import BannerRibbonForm from "./BannerRibbonForm"
import CountdownRibbonForm from "./CountdownRibbonForm"
import CoverImageRibbonForm from "./CoverImageRibbonForm"
import ImageGalleryRibbonForm from "./ImagaGalleryRibbonForm"
import ImageCarouselRibbonForm from "./ImageCarouselRibbonForm"
import TextRibbonForm from "./TextRibbonForm"

const detailsValidator = withZod(
  z.object({
    name: RibbonNameSchema,
  })
)

export async function loader({ params, context }: LoaderArgs) {
  const db = context.db
  const { ribbonId } = zx.parseParams(params, {
    ribbonId: z.string(),
  })

  const ribbon = await db.ribbon.findUniqueOrThrow({
    where: { id: ribbonId },
  })

  return json({ ribbon })
}

export async function action({ params, request, context }: ActionArgs) {
  const { db } = context

  const { ribbonId } = zx.parseParams(params, { ribbonId: z.string() })
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized({ message: "You must be logged in to edit a ribbon" })
  }

  if (user.role !== UserRole.Admin) {
    throw unauthorized({ message: "You must be an admin to edit a ribbon" })
  }

  const ribbon = await db.ribbon.findUnique({ where: { id: ribbonId } })

  if (!ribbon) {
    throw notFound({ message: "Ribbon not found" })
  }

  return namedAction(request, {
    async delete() {
      const deletedRibbon = await db.ribbon.delete({
        where: { id: ribbonId },
      })
      return json({ ribbon: deletedRibbon, success: true })
    },
    async duplicate() {
      const ribbonCount = await db.ribbon.count({
        where: { listingId: ribbon.listingId },
      })

      const duplicatedRibbon = await db.ribbon.create({
        data: {
          listingId: ribbon.listingId,
          name: `${ribbon.name} (copy)`,
          position: ribbonCount,
          properties: ribbon.properties!,
          type: ribbon.type,
        },
      })

      return json({ ribbon: duplicatedRibbon, success: true })
    },
    async update() {
      const schemas = {
        [RibbonType.Banner]: BannerPropertiesSchema,
        [RibbonType.Countdown]: CountdownPropertiesSchema,
        [RibbonType.CoverImage]: CoverImagePropertiesSchema,
        [RibbonType.ImageCarousel]: ImageCarouselPropertiesSchema,
        [RibbonType.ImageGallery]: ImageGalleryPropertiesSchema,
        [RibbonType.Text]: TextPropertiesSchema,
      }

      const formData = await request.formData()
      const validator = withZod(
        z.object({
          name: RibbonNameSchema,
          properties: schemas[ribbon.type],
        })
      )
      const result = await validator.validate(formData)

      if (result.error) {
        return json({ success: false, ...result.error })
      }

      const updatedRibbon = await db.ribbon.update({
        data: {
          name: result.data.name,
          // TODO(adelrodriguez): Fix this type error
          // @ts-expect-error (due to the eventDatetime property of the CountdownPropertiesSchema)
          properties: result.data.properties,
        },
        where: { id: ribbonId },
      })

      return json({ ribbon: updatedRibbon, success: true })
    },
  })
}

export default function DashboardListingRibbonsEditPage() {
  const { ribbon } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const { close, leave, open } = useDialogPage()
  const navigation = useNavigation()
  const submit = useSubmit()

  useEffect(() => {
    if (!actionData) return

    if (!actionData.success) return

    close()
  }, [actionData, close])

  const formId = `form-${ribbon.id}`

  function handleSubmit() {
    const $form1 = document.getElementById("details-form") as HTMLFormElement
    const $form2 = document.getElementById(formId) as HTMLFormElement

    const formData1 = new FormData($form1)
    const formData2 = new FormData($form2)

    const formData = new FormData()

    for (const [key, value] of formData1.entries()) {
      formData.append(key, value)
    }

    for (const [key, value] of formData2.entries()) {
      formData.append(`properties.${key}`, value)
    }

    formData.append("_action", "update")

    submit(formData, { method: "POST" })
  }

  return (
    <Transition.Root appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={leave}
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
              <Dialog.Panel className="relative w-full transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:max-w-5xl sm:p-6">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Edit Ribbon
                </Dialog.Title>

                <div className="mt-4 space-y-12">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-4">
                    <div>
                      <h2 className="text-base font-semibold leading-7 text-gray-900">
                        Details
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        Edit the name of the ribbon.
                      </p>
                    </div>

                    <div className="col-span-1 md:col-span-3">
                      <ValidatedForm
                        validator={detailsValidator}
                        defaultValues={{ name: ribbon.name }}
                        method="POST"
                        action="?/details"
                        className="space-y-6"
                        id="details-form"
                      >
                        <Input
                          name="name"
                          label="Name"
                          description="The name of the ribbon, as it will appear on the menu"
                        />
                      </ValidatedForm>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-4">
                    <div>
                      <h2 className="text-base font-semibold leading-7 text-gray-900">
                        Properties
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        Change the specific properties of the ribbon.
                      </p>
                    </div>

                    <div className="col-span-1 md:col-span-3">
                      {ribbon.type === RibbonType.Banner && (
                        <BannerRibbonForm
                          properties={ribbon.properties}
                          formId={formId}
                        />
                      )}
                      {ribbon.type === RibbonType.Countdown && (
                        <CountdownRibbonForm
                          properties={ribbon.properties}
                          formId={formId}
                        />
                      )}
                      {ribbon.type === RibbonType.CoverImage && (
                        <CoverImageRibbonForm
                          properties={ribbon.properties}
                          formId={formId}
                        />
                      )}
                      {ribbon.type === RibbonType.ImageCarousel && (
                        <ImageCarouselRibbonForm
                          properties={ribbon.properties}
                          formId={formId}
                        />
                      )}
                      {ribbon.type === RibbonType.ImageGallery && (
                        <ImageGalleryRibbonForm
                          properties={ribbon.properties}
                          formId={formId}
                        />
                      )}
                      {ribbon.type === RibbonType.Text && (
                        <TextRibbonForm
                          properties={ribbon.properties}
                          formId={formId}
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex justify-between">
                    <Form method="POST" action="?/duplicate">
                      <Button variant="secondary" onClick={close}>
                        Duplicate
                      </Button>
                    </Form>

                    <div className="flex gap-2">
                      <Form method="POST" action="?/delete">
                        <Button className="w-full" variant="danger">
                          Delete
                        </Button>
                      </Form>
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={navigation.state === "submitting"}
                      >
                        {navigation.state === "submitting" ? (
                          <>
                            <Spinner className="mr-2" />
                            Updating...
                          </>
                        ) : (
                          "Update"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
