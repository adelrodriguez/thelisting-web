import { Dialog, Transition } from "@headlessui/react"
import { RibbonType } from "@prisma/client"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { Form } from "@remix-run/react"
import { Fragment } from "react"
import { z } from "zod"
import { zx } from "zodix"

import {
  TextField,
  SubmitButton,
  ValidationErrors,
  ListRadioGroup,
} from "~/components/form"
import { useDialogPage } from "~/utils/hooks"
import {
  getParam,
  json,
  redirect,
  useActionData,
  useLoaderData,
} from "~/utils/remix"
import {
  RibbonTypeSchema,
  RibbonNameSchema,
  RibbonPositionSchema,
} from "~/utils/ribbon"

const AddRibbonSchema = z.object({
  name: RibbonNameSchema,
  position: RibbonPositionSchema,
  type: RibbonTypeSchema,
})

export async function loader({ request }: LoaderArgs) {
  const requestUrl = new URL(request.url)
  const position = requestUrl.searchParams.get("position")

  return { position }
}

export async function action({ params, context, request }: ActionArgs) {
  const { db, logger } = context
  const sku = getParam(params, "listing")

  const result = await zx.parseFormSafe(request, AddRibbonSchema)

  if (!result.success) {
    return json({ errors: result.error.flatten().fieldErrors })
  }

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
  const actionData = useActionData<typeof action>()

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

                <Form
                  className="mx-auto mt-4 flex flex-col gap-y-3"
                  method="POST"
                >
                  <ValidationErrors errors={actionData?.errors} />
                  <input
                    type="hidden"
                    name="position"
                    className="hidden"
                    defaultValue={position ?? "0"}
                  />

                  <TextField
                    description="The name of the ribbon"
                    label="Name"
                    name="name"
                    schema={RibbonNameSchema}
                    isRequired
                  />
                  <ListRadioGroup
                    description="The type of ribbon"
                    label="Type"
                    name="type"
                    options={Object.values(RibbonType).map((type) => ({
                      label: type,
                      value: type,
                    }))}
                    isRequired
                    defaultValue={RibbonType.Banner}
                  />
                  <SubmitButton />
                </Form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
