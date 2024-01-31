import { Dialog, Transition } from "@headlessui/react"
import {
  Square2StackIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { RibbonType } from "@prisma/client"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import {
  useActionData,
  useLoaderData,
  Form as RemixForm,
} from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import { Fragment, useEffect } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import { SubmitButton } from "~/components/form"
import { isUserAdmin } from "~/utils/auth.server"
import { getFontList } from "~/utils/font"
import { useDialogPage } from "~/utils/hooks"
import { notFound } from "~/utils/http"
import {
  BannerRibbon,
  CountdownRibbon,
  CoverImageRibbon,
  ImageCarouselRibbon,
  ImageGalleryRibbon,
  LocationRibbon,
  RegistryShowcaseRibbon,
  TextRibbon,
} from "~/utils/ribbons"

import BannerRibbonForm from "./BannerRibbonForm"
import CountdownRibbonForm from "./CountdownRibbonForm"
import CoverImageRibbonForm from "./CoverImageRibbonForm"
import ImageCarouselRibbonForm from "./ImageCarouselRibbonForm"
import ImageGalleryRibbonForm from "./ImageGalleryRibbonForm"
import LocationRibbonForm from "./LocationRibbonForm"
import RegistryShowcaseRibbonForm from "./RegistryShowcaseRibbonForm"
import TextRibbonForm from "./TextRibbonForm"

export async function loader({ context, params }: LoaderFunctionArgs) {
  const db = context.db
  const cache = context.cache
  const env = context.env

  const { ribbonId } = zx.parseParams(params, {
    ribbonId: z.string(),
  })

  const ribbon = await db.ribbon.findUniqueOrThrow({
    where: { id: ribbonId },
  })

  const fonts = await getFontList(
    cache,
    env.GOOGLE_WEB_FONTS_URL,
    env.GOOGLE_WEB_FONTS_DEVELOPER_API_KEY,
  )

  return json({ fontFamilies: fonts.map((font) => font.family), ribbon })
}

export async function action({ context, params, request }: ActionFunctionArgs) {
  await isUserAdmin(request)

  const { db } = context

  const { listingSku, ribbonId } = zx.parseParams(params, {
    listingSku: z.string(),
    ribbonId: z.string(),
  })

  const ribbon = await db.ribbon.findUnique({ where: { id: ribbonId } })

  if (!ribbon) {
    throw notFound({ message: "Ribbon not found" })
  }

  const formData = await request.formData()
  const subaction = formData.get("subaction")

  switch (subaction) {
    case "delete": {
      await db.ribbon.delete({
        where: { id: ribbonId },
      })

      return redirect(
        route("/dashboard/listings/:listingSku/ribbons", { listingSku }),
      )
    }

    case "duplicate": {
      const ribbonCount = await db.ribbon.count({
        where: { listingId: ribbon.listingId },
      })

      const newRibbon = await db.ribbon.create({
        data: {
          listingId: ribbon.listingId,
          name: `${ribbon.name} (copy)`,
          position: ribbonCount,
          properties: ribbon.properties ?? {},
          type: ribbon.type,
        },
      })

      return json({ ribbon: newRibbon, success: true })
    }

    case "update": {
      let schema: z.ZodSchema | undefined

      switch (ribbon.type) {
        case RibbonType.Banner:
          schema = BannerRibbon
          break
        case RibbonType.Countdown:
          schema = CountdownRibbon
          break
        case RibbonType.CoverImage:
          schema = CoverImageRibbon
          break
        case RibbonType.ImageCarousel:
          schema = ImageCarouselRibbon
          break
        case RibbonType.ImageGallery:
          schema = ImageGalleryRibbon
          break
        case RibbonType.Location:
          schema = LocationRibbon
          break
        case RibbonType.RegistryShowcase:
          schema = RegistryShowcaseRibbon
          break
        case RibbonType.Text:
          schema = TextRibbon
          break
        default:
          throw notFound({ message: "Ribbon type not found" })
      }

      const validator = withZod(schema)
      const result = await validator.validate(formData)

      if (result.error) {
        return json({ success: false, ...result.error })
      }

      const updatedRibbon = await db.ribbon.update({
        data: {
          name: result.data.name,
          properties: result.data.properties,
          styles: result.data.styles,
        },
        where: { id: ribbonId },
      })

      return json({ ribbon: updatedRibbon, success: true })
    }

    default:
      throw notFound({ message: "Action not found" })
  }
}

export default function DashboardListingRibbonsEditPage() {
  const { fontFamilies, ribbon } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const { close, leave, open } = useDialogPage()
  const formId = `form-${ribbon.id}`

  useEffect(() => {
    if (!actionData) return

    if (!actionData.success) return

    close()
  }, [actionData, close])

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
              <Dialog.Panel className="relative flex w-full transform flex-col gap-y-4 overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:max-w-xl sm:p-6">
                <Dialog.Title as="div" className="flex justify-between">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Edit Ribbon
                  </h3>
                  <div className="flex items-center gap-x-4">
                    <RemixForm className="flex items-center" method="POST">
                      <input name="subaction" type="hidden" value="delete" />
                      <button title="Delete the ribbon">
                        <TrashIcon className="h-5 w-5 text-red-500" />
                      </button>
                    </RemixForm>

                    <RemixForm className="flex items-center" method="POST">
                      <input name="subaction" type="hidden" value="duplicate" />
                      <button title="Duplicate the ribbon">
                        <Square2StackIcon className="h-5 w-5 text-gray-500" />
                      </button>
                    </RemixForm>

                    <button onClick={close}>
                      <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </Dialog.Title>

                {ribbon.type === RibbonType.Banner && (
                  <BannerRibbonForm
                    fontFamilies={fontFamilies}
                    formId={formId}
                    ribbon={ribbon}
                  />
                )}
                {ribbon.type === RibbonType.Countdown && (
                  <CountdownRibbonForm formId={formId} ribbon={ribbon} />
                )}
                {ribbon.type === RibbonType.CoverImage && (
                  <CoverImageRibbonForm formId={formId} ribbon={ribbon} />
                )}
                {ribbon.type === RibbonType.ImageCarousel && (
                  <ImageCarouselRibbonForm formId={formId} ribbon={ribbon} />
                )}
                {ribbon.type === RibbonType.ImageGallery && (
                  <ImageGalleryRibbonForm formId={formId} ribbon={ribbon} />
                )}
                {ribbon.type === RibbonType.Location && (
                  <LocationRibbonForm formId={formId} ribbon={ribbon} />
                )}
                {ribbon.type === RibbonType.RegistryShowcase && (
                  <RegistryShowcaseRibbonForm formId={formId} ribbon={ribbon} />
                )}
                {ribbon.type === RibbonType.Text && (
                  <TextRibbonForm formId={formId} ribbon={ribbon} />
                )}
                <SubmitButton
                  className=""
                  formId={formId}
                  loadingText="Updating..."
                >
                  Update
                </SubmitButton>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
