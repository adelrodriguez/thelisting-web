import { Dialog, Transition } from "@headlessui/react"
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline"
import type { Listing } from "@prisma/client"
import {
  Link,
  Outlet,
  useNavigate,
  useNavigation,
  useOutletContext,
  useSubmit,
} from "@remix-run/react"
import { Fragment, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button, FormattedNumber } from "~/components/common"
import Tooltip from "~/components/common/Tooltip"
import { Spinner } from "~/components/loading"
import { CartItem } from "~/components/registry"
import { useCart } from "~/utils/hooks"
import { getPriceSymbol } from "~/utils/money"

export const handle = {
  i18n: ["listing", "common"],
}

export default function ListingCartPage() {
  const [open, setOpen] = useState(true)
  const cart = useCart()
  const listing = useOutletContext<Listing>()
  const navigate = useNavigate()
  const submit = useSubmit()
  const navigation = useNavigation()
  const { t } = useTranslation(handle.i18n)

  function handleSubmit() {
    const formData = new FormData()
    const cartItems = JSON.stringify([...cart.items.values()])

    formData.append("cartItems", cartItems)
    formData.append("listingId", listing.id)
    formData.append("sku", `${listing.sku}`)

    if (cart.noteId) {
      formData.append("noteId", cart.noteId)
    }

    submit(formData, {
      action: `${listing.path}/cart/checkout`,
      method: "post",
    })
  }

  return (
    <Transition.Root
      appear
      show={open}
      as={Fragment}
      afterLeave={() => navigate("../", { preventScrollReset: true })}
    >
      <Dialog as="div" className="relative z-20" onClose={() => setOpen(false)}>
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
                        <Dialog.Title className="font-header text-2xl font-bold text-gray-900">
                          {t("cart")}
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

                    <div className="border-t border-gray-200 py-6 px-4  sm:px-6">
                      <dl className="space-y-2 text-sm font-medium text-gray-500">
                        <div className="flex justify-between">
                          <dt>{t("common:subtotal")}</dt>
                          <dd>
                            <FormattedNumber
                              prefix={getPriceSymbol("DOP")}
                              thousands
                              decimals={2}
                            >
                              {cart.subtotal}
                            </FormattedNumber>
                          </dd>
                        </div>

                        <div className="flex justify-between">
                          <dt className="flex items-center">
                            {t("common:shipping")}
                            <Tooltip text={t("shippingNote")}>
                              <InformationCircleIcon className="ml-0.5 h-4 w-4" />
                            </Tooltip>
                          </dt>
                          <dd>
                            <FormattedNumber
                              prefix={getPriceSymbol("DOP")}
                              thousands
                              decimals={2}
                            >
                              {cart.shipping}
                            </FormattedNumber>
                          </dd>
                        </div>

                        <div className="flex items-center justify-between  text-gray-900">
                          <dt>{t("common:total")}</dt>
                          <dd>
                            <FormattedNumber
                              prefix={getPriceSymbol("DOP")}
                              thousands
                              decimals={2}
                            >
                              {cart.total}
                            </FormattedNumber>
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-4 flex justify-center text-center text-sm text-gray-500">
                        <Link
                          to={
                            "note" +
                            (cart.noteId ? "?note_id=" + cart.noteId : "")
                          }
                          relative="route"
                          className="font-medium text-gray-600 hover:text-gray-500"
                        >
                          {cart.noteId ? t("messageAdded") : t("addAMessage")}
                        </Link>
                      </div>
                      <div className="mt-6">
                        <Button
                          size="xl"
                          className="w-full"
                          onClick={handleSubmit}
                          disabled={
                            cart.items.size === 0 ||
                            navigation.state === "submitting"
                          }
                        >
                          {cart.items.size === 0 ? (
                            t("checkout.empty")
                          ) : navigation.state === "submitting" ? (
                            <>
                              <Spinner />
                              {t("checkout.submitting")}
                            </>
                          ) : (
                            t("checkout.ready")
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
