import { Dialog, Transition } from "@headlessui/react"
import { RibbonType } from "@prisma/client"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { Fragment } from "react"
import { redirect } from "react-router"
import { ValidatedForm, validationError } from "remix-validated-form"
import { z } from "zod"

import { FormInput, FormListRadioGroup, FormSubmit } from "~/components/form"
import db from "~/helpers/db.server"
import { useDialogPage } from "~/utils/hooks"
import { getParam, useLoaderData } from "~/utils/remix"
import { RibbonTypeSchema } from "~/utils/ribbon"

const AddRibbonSchema = z.object({
  name: z.string(),
  position: z.coerce.number(),
  type: RibbonTypeSchema,
})

const validator = withZod(AddRibbonSchema)

export async function loader({ request }: LoaderArgs) {
  const requestUrl = new URL(request.url)
  const position = requestUrl.searchParams.get("position")

  return { position }
}

export async function action({ params, context, request }: ActionArgs) {
  const logger = context.logger
  const sku = getParam(params, "listing")

  const result = await validator.validate(await request.formData())

  if (result.error) return validationError(result.error)

  const ribbons = await db.ribbon.findMany({
    orderBy: { position: "asc" },
    select: { id: true, position: true },
    where: { listing: { sku: Number(sku) } },
  })

  const ribbon = await db.ribbon.create({
    data: {
      listing: {
        connect: {
          sku: Number(sku),
        },
      },
      name: result.data.name,
      position: result.data.position,
      type: result.data.type,
    },
  })

  logger.info("Created new ribbon", { ribbon })

  const ribbonsAfter = ribbons.slice(result.data.position)

  for (const [index, ribbon] of ribbonsAfter.entries()) {
    const newPosition = index + result.data.position + 1
    await db.ribbon.update({
      data: { position: newPosition },
      where: { id: ribbon.id },
    })

    logger.info(
      `Updated ribbon ${ribbon.id} moved position: ${ribbon.position} → ${newPosition}`
    )
  }

  return redirect(`/dashboard/listings/${sku}/ribbons`)
}

export default function DashboardListingRibbonsEditPage() {
  const { position } = useLoaderData<typeof loader>()
  const { close, leave, open } = useDialogPage()

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
              <Dialog.Panel className="relative w-full transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:max-w-lg sm:p-6">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Add a new ribbon
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Your payment has been successfully submitted. We’ve sent you
                    an email with all of the details of your order.
                  </p>
                </div>

                <ValidatedForm
                  className="mx-auto flex flex-col gap-y-6"
                  validator={validator}
                  defaultValues={{ position: Number(position) }}
                  method="post"
                  reloadDocument
                >
                  <FormInput type="hidden" name="position" />
                  <FormInput label="Name" name="name" required />
                  <FormListRadioGroup
                    name="type"
                    label="Type"
                    options={Object.values(RibbonType).map((type) => ({
                      label: type,
                      value: type,
                    }))}
                    required
                  />
                  <FormSubmit />
                </ValidatedForm>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
