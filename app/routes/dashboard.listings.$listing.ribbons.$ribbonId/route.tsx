import { Dialog, Transition } from "@headlessui/react"
import {
  Square2StackIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { UserRole, RibbonType } from "@prisma/client"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { Fragment, useEffect } from "react"
import { ValidatedForm } from "remix-validated-form"
import { z } from "zod"
import { zx } from "zodix"

import { Input, SubmitButton } from "~/components/form"
import auth from "~/helpers/auth.server"
import { isUserAdmin } from "~/utils/auth.server"
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
  LocationPropertiesSchema,
} from "~/utils/ribbons"

import BannerRibbonForm from "./BannerRibbonForm"
import CountdownRibbonForm from "./CountdownRibbonForm"
import CoverImageRibbonForm from "./CoverImageRibbonForm"
import ImageGalleryRibbonForm from "./ImagaGalleryRibbonForm"
import ImageCarouselRibbonForm from "./ImageCarouselRibbonForm"
import LocationRibbonForm from "./LocationRibbonForm"
import TextRibbonForm from "./TextRibbonForm"

const detailsValidator = withZod(
  z.object({
    name: RibbonNameSchema,
  })
)

export async function loader({ params, context }: LoaderFunctionArgs) {
  const db = context.db
  const { ribbonId } = zx.parseParams(params, {
    ribbonId: z.string(),
  })

  const ribbon = await db.ribbon.findUniqueOrThrow({
    where: { id: ribbonId },
  })

  return json({ ribbon })
}

export async function action({ params, context, request }: ActionFunctionArgs) {
  await isUserAdmin(request)

  const { db } = context

  const { ribbonId } = zx.parseParams(params, { ribbonId: z.string() })
  const { action } = zx.parseQuery(request, { action: z.string() })

  const ribbon = await db.ribbon.findUnique({ where: { id: ribbonId } })

  if (!ribbon) {
    throw notFound({ message: "Ribbon not found" })
  }

  // TODO(adelrodriguez): This might be totally broken since we removed
  // remix-utils. Eventually the Form component should be replaced with a
  // ValidatedForm component that includes a subaction and we can be sure that's
  // solved.
  switch (action) {
    case "delete": {
      const deletedRibbon = await db.ribbon.delete({
        where: { id: ribbonId },
      })
      return json({ ribbon: deletedRibbon, success: true })
    }
    case "details": {
      const formData = await request.formData()
      const result = await detailsValidator.validate(formData)

      if (result.error) {
        return json({ success: false, ...result.error })
      }

      const updatedRibbon = await db.ribbon.update({
        data: {
          name: result.data.name,
        },
        where: { id: ribbonId },
      })

      return json({ ribbon: updatedRibbon, success: true })
    }
    case "duplicate": {
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
    }
    case "properties": {
      const schemas = {
        [RibbonType.Banner]: BannerPropertiesSchema,
        [RibbonType.Countdown]: CountdownPropertiesSchema,
        [RibbonType.CoverImage]: CoverImagePropertiesSchema,
        [RibbonType.ImageCarousel]: ImageCarouselPropertiesSchema,
        [RibbonType.ImageGallery]: ImageGalleryPropertiesSchema,
        [RibbonType.Text]: TextPropertiesSchema,
        [RibbonType.Location]: LocationPropertiesSchema,
      }

      const formData = await request.formData()
      // TODO(adelrodriguez): Fix this type error
      // @ts-expect-error Due to union type
      const validator = withZod(schemas[ribbon.type])
      const result = await validator.validate(formData)

      if (result.error) {
        return json({ success: false, ...result.error })
      }

      const updatedRibbon = await db.ribbon.update({
        data: { properties: result.data },
        where: { id: ribbonId },
      })

      return json({ ribbon: updatedRibbon, success: true })
    }
    default:
      throw notFound({ message: "Action not found" })
  }
}

export default function DashboardListingRibbonsEditPage() {
  const { ribbon } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const { close, leave, open } = useDialogPage()

  useEffect(() => {
    if (!actionData) return

    if (!actionData.success) return

    close()
  }, [actionData, close])

  const formId = `form-${ribbon.id}`

  return (
    <Transition.Root appear as={Fragment} show={open}>
      <Dialog as="div" className="relative z-10" onClose={close}>
        <Transition.Child
          afterLeave={leave}
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
              <Dialog.Panel className="relative w-full transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:max-w-5xl sm:p-6">
                <Dialog.Title as="div" className="flex justify-between">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Edit Ribbon
                  </h3>
                  <div className="flex items-center gap-x-4">
                    <Form
                      action="?/delete"
                      className="flex items-center"
                      method="POST"
                    >
                      <button title="Delete the ribbon">
                        <TrashIcon className="h-5 w-5 text-red-500" />
                      </button>
                    </Form>
                    <Form
                      action="?/duplicate"
                      className="flex items-center"
                      method="POST"
                    >
                      <button>
                        <Square2StackIcon className="h-5 w-5 text-gray-500" />
                      </button>
                    </Form>
                    <button onClick={close}>
                      <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
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
                        action="?/details"
                        className="grid"
                        defaultValues={{ name: ribbon.name }}
                        id="details-form"
                        method="POST"
                        validator={detailsValidator}
                      >
                        <Input
                          description="The name of the ribbon, as it will appear on the menu"
                          id="details-form"
                          label="Name"
                          name="name"
                        />
                        <SubmitButton
                          className="mt-4 justify-self-end"
                          loadingText="Updating..."
                        >
                          Update
                        </SubmitButton>
                      </ValidatedForm>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-4">
                    <div>
                      <h2 className="text-base font-semibold leading-7 text-gray-900">
                        Properties
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        Change the specific properties of the ribbon.
                      </p>
                    </div>

                    <div className="col-span-1 grid md:col-span-3">
                      {ribbon.type === RibbonType.Banner && (
                        <BannerRibbonForm
                          formId={formId}
                          properties={ribbon.properties}
                        />
                      )}
                      {ribbon.type === RibbonType.Countdown && (
                        <CountdownRibbonForm
                          formId={formId}
                          properties={ribbon.properties}
                        />
                      )}
                      {ribbon.type === RibbonType.CoverImage && (
                        <CoverImageRibbonForm
                          formId={formId}
                          properties={ribbon.properties}
                        />
                      )}
                      {ribbon.type === RibbonType.ImageCarousel && (
                        <ImageCarouselRibbonForm
                          formId={formId}
                          properties={ribbon.properties}
                        />
                      )}
                      {ribbon.type === RibbonType.ImageGallery && (
                        <ImageGalleryRibbonForm
                          formId={formId}
                          properties={ribbon.properties}
                        />
                      )}
                      {ribbon.type === RibbonType.Location && (
                        <LocationRibbonForm
                          formId={formId}
                          properties={ribbon.properties}
                        />
                      )}
                      {ribbon.type === RibbonType.Text && (
                        <TextRibbonForm
                          formId={formId}
                          properties={ribbon.properties}
                        />
                      )}
                      <SubmitButton
                        className="mt-4 justify-self-end"
                        formId={formId}
                        loadingText="Updating..."
                      >
                        Update
                      </SubmitButton>
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
