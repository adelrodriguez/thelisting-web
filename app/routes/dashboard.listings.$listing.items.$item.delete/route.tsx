import { Dialog, Transition } from "@headlessui/react"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form } from "@remix-run/react"
import { Fragment, useRef } from "react"
import { z } from "zod"
import { zx } from "zodix"

import { Button } from "~/components/common"
import { useDialogPage } from "~/utils/hooks"
import { removeProductsFromCollection } from "~/utils/shopify.server"

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const { db } = context
  const { item: itemSku, listing: listingSku } = zx.parseParams(
    params,
    z.object({ item: z.string(), listing: zx.NumAsString })
  )

  const itemPurchases = await db.itemPurchase.count({
    where: { item: { sku: itemSku } },
  })

  if (itemPurchases > 0)
    return redirect(`/dashboard/listings/${listingSku}/items/${itemSku}`)

  return null
}

export async function action({ context, params }: ActionFunctionArgs) {
  const { db } = context
  const { item: itemSku, listing: listingSku } = zx.parseParams(
    params,
    z.object({ item: z.string(), listing: zx.NumAsString })
  )

  const listing = await db.listing.findUniqueOrThrow({
    select: { commerceId: true, sku: true },
    where: { sku: listingSku },
  })

  const item = await db.item.delete({ where: { sku: itemSku } })

  if (listing.commerceId && item.commerceId) {
    await removeProductsFromCollection(listing.commerceId, [item.commerceId])
  }

  return redirect(`/dashboard/listings/${listing.sku}/items`)
}

export default function Example() {
  const { open, close, leave } = useDialogPage()

  const cancelButtonRef = useRef(null)

  return (
    <Transition.Root appear as={Fragment} show={open}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={close}
      >
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
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              afterLeave={leave}
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-red-600"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      Delete item
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the item your account?
                        It will also be removed from any collections on Shopify.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <Form method="POST">
                    <Button
                      className="w-full sm:ml-3 sm:w-auto"
                      title="This item has been purchased and cannot be deleted."
                      type="submit"
                      variant="danger"
                    >
                      Delete
                    </Button>
                  </Form>

                  <Button
                    onClick={close}
                    ref={cancelButtonRef}
                    type="button"
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
