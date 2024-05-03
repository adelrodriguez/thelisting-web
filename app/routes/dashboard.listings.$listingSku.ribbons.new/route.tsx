import { Dialog, Transition } from "@headlessui/react"
import { RibbonType } from "@prisma/client"
import type { ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { Fragment } from "react"
import { ValidatedForm as Form, validationError } from "remix-validated-form"
import { route } from "routes-gen"
import { z } from "zod"
import { zx } from "zodix"

import { ListRadioGroup, SubmitButton } from "~/components/form"
import { useDialogPage } from "~/utils/hooks"
import { RibbonType as RibbonTypeSchema } from "~/utils/ribbons"

const validator = withZod(
  z.object({
    type: RibbonTypeSchema,
  }),
)

export async function action({ context, params, request }: ActionFunctionArgs) {
  const { db, logger } = context
  const { listingSku } = zx.parseParams(params, {
    listingSku: z.coerce.number(),
  })
  const formData = await request.formData()
  const result = await validator.validate(formData)

  if (result.error) {
    return validationError(result.error)
  }

  const ribbons = await db.ribbon.findMany({
    orderBy: { position: "asc" },
    select: { id: true, position: true },
    where: { listing: { sku: listingSku } },
  })

  const ribbon = await db.ribbon.create({
    data: {
      listing: {
        connect: {
          sku: listingSku,
        },
      },
      name: result.data.type,
      position: ribbons.length + 1,
      type: result.data.type,
    },
  })

  logger.info("Created new ribbon", { ribbon })

  return redirect(
    route("/dashboard/listings/:listingSku/ribbons", {
      listingSku: `${listingSku}`,
    }),
  )
}

export default function DashboardListingRibbonsEditPage() {
  const { close, leave, open } = useDialogPage()

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
              <Dialog.Panel className="relative w-full transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:max-w-lg sm:p-6">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Add a new ribbon
                </Dialog.Title>

                <Form
                  className="mx-auto mt-4 flex flex-col gap-y-3"
                  method="POST"
                  validator={validator}
                >
                  <ListRadioGroup
                    description="The type of ribbon"
                    label="Type"
                    name="type"
                    options={Object.values(RibbonType).map((type) => ({
                      label: type,
                      value: type,
                    }))}
                    required
                  />
                  <SubmitButton>Create</SubmitButton>
                </Form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
