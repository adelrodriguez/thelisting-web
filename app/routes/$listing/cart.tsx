import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import type { Listing } from "@prisma/client"
import {
  Outlet,
  useNavigate,
  useOutletContext,
  useSubmit,
} from "@remix-run/react"
import { Fragment, useState } from "react"

import { Button, FormattedNumber } from "~/components/common"
import { CartItem, CartNote } from "~/components/registry"
import { useCart, useCurrentRouteMatch } from "~/utils/hooks"
import { getPriceSymbol } from "~/utils/money"

export default function ListingCartPage() {
  const [open, setOpen] = useState(true)
  const [showCartNote, setShowCartNote] = useState(false)
  const cart = useCart()
  const currentRouteMatch = useCurrentRouteMatch()
  const listing = useOutletContext<Listing>()
  const navigate = useNavigate()
  const submit = useSubmit()

  function handleSubmit() {
    const formData = new FormData()
    const cartItems = JSON.stringify([...cart.items.values()])

    formData.append("cartItems", cartItems)
    formData.append("listingId", listing.id)
    formData.append("note", cart.note || "")
    formData.append("sku", `${listing.sku}`)

    submit(formData, {
      action: `${currentRouteMatch.params.listing}/cart/checkout`,
      method: "post",
    })
  }

  return (
    <Transition.Root
      appear
      show={open}
      as={Fragment}
      afterLeave={() => navigate("../")}
    >
      <Dialog as="div" className="relative z-10" onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Shopping cart
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <Outlet />

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul className="-my-6 divide-y divide-gray-200">
                            {[...cart.items.values()].map((item) => (
                              <li key={item.id} className="flex py-6">
                                <CartItem {...item} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>
                          <FormattedNumber
                            prefix={getPriceSymbol("DOP")}
                            thousands
                            decimals={2}
                          >
                            {cart.subtotal}
                          </FormattedNumber>
                        </p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        Shipping and handling to the recipient calculated at
                        checkout.
                      </p>
                      <div className="mt-4 flex justify-center text-center text-sm text-gray-500">
                        <button
                          type="button"
                          className="font-medium text-gray-600 hover:text-gray-500"
                          onClick={() => setShowCartNote(true)}
                        >
                          Add a special message ✉️
                        </button>
                      </div>
                      <div className="mt-6">
                        <Button
                          size="xl"
                          className="w-full"
                          onClick={handleSubmit}
                        >
                          Checkout
                        </Button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
        <CartNote open={showCartNote} onClose={() => setShowCartNote(false)} />
      </Dialog>
    </Transition.Root>
  )
}
