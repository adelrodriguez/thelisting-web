import { Dialog, Transition } from "@headlessui/react"
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline"
import type { Listing } from "@prisma/client"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
  useNavigation,
  useOutletContext,
  useSubmit,
} from "@remix-run/react"
import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { zx } from "zodix"

import { Button } from "~/components/common"
import Tooltip from "~/components/common/Tooltip"
import { Spinner } from "~/components/loading"
import { captureEvent } from "~/services/posthog"
import {
  useCart,
  useDialogPage,
  useExchangeRate,
  useTrackPageview,
} from "~/utils/hooks"
import { formatPrice } from "~/utils/money"

import AddNoteReminderDialog from "./AddNoteReminderDialog"
import CartItem from "./CartItem"

export const handle = {
  i18n: ["registry", "common"],
}

export function loader({ request }: LoaderFunctionArgs) {
  const { alert_note: alertNote } = zx.parseQuery(
    request,
    z.object({
      alert_note: zx.BoolAsString.optional(),
    }),
  )

  return json({ alertNote })
}

export default function ListingCartPage() {
  const { open, close, leave } = useDialogPage()
  const { alertNote } = useLoaderData<typeof loader>()
  const cart = useCart()
  const listing = useOutletContext<Listing>()
  const navigate = useNavigate()
  const submit = useSubmit()
  const navigation = useNavigation()
  const { t } = useTranslation(handle.i18n)
  const { currency, exchangeRate } = useExchangeRate()

  useTrackPageview({ listingId: listing.id })

  function handleCheckoutClick() {
    if (!cart.noteId) {
      return navigate("?alert_note=true")
    }

    handleSubmit()
  }

  function handleSubmit() {
    const formData = new FormData()
    const cartItems = JSON.stringify([...cart.items.values()])

    formData.append("cartItems", cartItems)
    formData.append("listingId", listing.id)
    formData.append("sku", `${listing.sku}`)

    if (cart.noteId) {
      formData.append("noteId", cart.noteId)
    }

    captureEvent("checkout_started", {
      sku: listing.sku,
    })

    submit(formData, {
      action: `/${listing.path}/cart/checkout`,
      method: "post",
    })
  }

  return (
    <>
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
                            {t("cart")}
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                              onClick={close}
                              type="button"
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                aria-hidden="true"
                                className="h-6 w-6"
                              />
                            </button>
                          </div>
                        </div>

                        <Outlet />

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
                              {formatPrice(
                                cart.subtotal / exchangeRate,
                                currency,
                              )}
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
                              {formatPrice(
                                cart.shipping / exchangeRate,
                                currency,
                              )}
                            </dd>
                          </div>

                          <div className="flex items-center justify-between  text-gray-900">
                            <dt>{t("common:total")}</dt>
                            <dd>
                              {formatPrice(cart.total / exchangeRate, currency)}
                            </dd>
                          </div>
                        </dl>

                        <div className="mt-4 flex justify-center text-center text-sm text-gray-500">
                          <Link
                            className="font-medium text-gray-600 hover:text-gray-500"
                            preventScrollReset
                            relative="route"
                            to={
                              "note" +
                              (cart.noteId ? "?note_id=" + cart.noteId : "")
                            }
                          >
                            {cart.noteId ? t("messageAdded") : t("addAMessage")}
                          </Link>
                        </div>
                        <div className="mt-6">
                          <Button
                            className="w-full"
                            disabled={
                              cart.items.size === 0 ||
                              navigation.state === "submitting"
                            }
                            onClick={handleCheckoutClick}
                            size="xl"
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
      <AddNoteReminderDialog
        onCancel={() => handleSubmit()}
        // TODO(adelrodriguez): Replace with route()
        onClose={() => navigate("./")}
        onConfirm={() => navigate("./note")}
        open={!!alertNote}
      />
    </>
  )
}
