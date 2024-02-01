import { Dialog, Transition } from "@headlessui/react"
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline"
import type { Listing } from "@prisma/client"
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
  useOutletContext,
} from "@remix-run/react"
import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import { route } from "routes-gen"

import { Button } from "~/components/common"
import Tooltip from "~/components/common/Tooltip"
import { Spinner } from "~/components/loading"
import { calculateShipping, calculateSubtotal } from "~/utils/cart"
import { useCart, useDialogPage, useExchangeRate } from "~/utils/hooks"
import { formatPrice } from "~/utils/money"
import { RouteHandle } from "~/utils/remix"

import CartItem from "./CartItem"

export const handle: RouteHandle = {
  id: "listing-registry-cart",
}

export default function Page() {
  const { close, leave, open } = useDialogPage()
  const cart = useCart()
  const listing = useOutletContext<Listing>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const { t } = useTranslation(["common", "registry"])
  const { currency, exchangeRate } = useExchangeRate()
  const location = useLocation()
  const subtotal = calculateSubtotal([...cart.items.values()])
  const shipping = calculateShipping(subtotal)
  const total = subtotal + shipping

  return (
    <Transition.Root appear as={Fragment} show={open}>
      <Dialog as="div" className="relative z-20" onClose={close}>
        <Transition.Child
          afterLeave={leave}
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
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="font-heading text-2xl font-bold text-gray-900">
                          {t("registry:cart")}
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={close}
                            type="button"
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-2 mt-4">
                        <Outlet />
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul className="-my-6 divide-y divide-gray-200">
                            {[...cart.items.values()].map((item) => (
                              <li className="flex py-6" key={item.id}>
                                <CartItem {...item} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6  sm:px-6">
                      <dl className="space-y-2 text-sm font-medium text-gray-500">
                        <div className="flex justify-between">
                          <dt>{t("common:subtotal")}</dt>
                          <dd>
                            {formatPrice(subtotal / exchangeRate, currency)}
                          </dd>
                        </div>

                        <div className="flex justify-between">
                          <dt className="flex items-center">
                            {t("registry:shipping_and_handling")}
                            <Tooltip text={t("registry:shipping_note")}>
                              <InformationCircleIcon className="ml-0.5 h-4 w-4" />
                            </Tooltip>
                          </dt>
                          <dd>
                            {formatPrice(shipping / exchangeRate, currency)}
                          </dd>
                        </div>

                        <div className="flex items-center justify-between  text-gray-900">
                          <dt>{t("common:total")}</dt>
                          <dd>{formatPrice(total / exchangeRate, currency)}</dd>
                        </div>
                      </dl>

                      <div className="mt-4 flex justify-center text-center text-sm text-gray-500">
                        <Link
                          className="font-medium text-gray-600 hover:text-gray-500"
                          preventScrollReset
                          relative="route"
                          to={{
                            pathname: route("/:listing/cart/note", {
                              listing: listing.path,
                            }),
                            search: location.search,
                          }}
                        >
                          {cart.noteId
                            ? t("registry:note.added")
                            : t("registry:note.add")}
                        </Link>
                      </div>
                      <div className="mt-6">
                        <Button
                          className="w-full"
                          disabled={
                            cart.items.size === 0 ||
                            navigation.state === "submitting"
                          }
                          onClick={() => {
                            if (cart.noteId) {
                              cart.checkout()
                            } else {
                              navigate(
                                route("/:listing/cart/confirm", {
                                  listing: listing.path,
                                }) + location.search,
                              )
                            }
                          }}
                          size="xl"
                        >
                          {cart.items.size === 0 ? (
                            t("registry:checkout.empty")
                          ) : navigation.state === "submitting" ? (
                            <>
                              <Spinner />
                              {t("registry:checkout.submitting")}
                            </>
                          ) : (
                            t("registry:checkout.ready")
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
