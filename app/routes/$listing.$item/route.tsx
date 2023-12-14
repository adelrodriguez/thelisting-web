import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { redirect, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import posthog from "posthog-js"
import { Fragment, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "~/components/common"
import {
  useCart,
  useDialogPage,
  useExchangeRate,
  useProduct,
} from "~/utils/hooks"
import { formatPrice } from "~/utils/money"

import QuantityInput from "./QuantityInput"

export const handle = {
  i18n: "registry",
}

export async function loader({ params, context }: LoaderFunctionArgs) {
  const db = context.db
  const sku = params.item

  try {
    const item = await db.item.findFirst({
      where: { sku },
    })

    if (!item) {
      throw redirect("..")
    }

    return json({ item })
  } catch (error) {
    throw redirect("..")
  }
}

export default function ListingItemDetailPage() {
  const cart = useCart()
  const { item } = useLoaderData<typeof loader>()
  const { open, close, leave } = useDialogPage()
  const { data, isPending, isError } = useProduct(item.commerceId ?? "")
  const isAvailable = item.stock > 0
  const [quantity, setQuantity] = useState(Number(isAvailable))
  const { t } = useTranslation(handle.i18n)
  const { currency, exchangeRate } = useExchangeRate()

  // TODO(adelrodriguez): Handle loading and error states
  if (isPending) return null
  if (isError) return <div>Error!</div>

  const { title, price, variantId, imageUrl } = data

  function handleAddToCart() {
    const { id, commerceId, sku } = item

    if (!commerceId) throw new Error("Item must have a commerceId")
    if (!variantId) throw new Error("Item must have a variantId")

    cart.add({ commerceId, id, price, quantity, sku, variantId })

    posthog.capture("item_added", { id, price, quantity, sku })

    close()
  }

  return (
    <Transition.Root appear as={Fragment} show={open}>
      <Dialog as="div" className="relative z-20" onClose={close}>
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
          <div className="fixed inset-0 hidden bg-gray-500 bg-opacity-75 transition-opacity md:block" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
            <Transition.Child
              afterLeave={leave}
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
              enterTo="opacity-100 translate-y-0 md:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 md:scale-100"
              leaveTo="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
            >
              <Dialog.Panel className="flex w-full transform text-left text-base transition md:my-8 md:max-w-2xl md:px-4 lg:max-w-4xl">
                <div className="relative flex w-full items-center overflow-hidden rounded-md bg-white px-4 pb-8 pt-14 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
                  <button
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 sm:right-6 sm:top-8 md:right-6 md:top-6 lg:right-8 lg:top-8"
                    onClick={close}
                    type="button"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                  </button>

                  <div className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-12 lg:gap-x-8">
                    <div className="sm:col-span-4 lg:col-span-5 ">
                      <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-sm bg-gray-100 sm:rounded-md">
                        <img
                          alt={title}
                          className="object-cover object-center"
                          src={imageUrl}
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-8 lg:col-span-7">
                      <h2 className="font-heading text-2xl font-bold text-gray-900 sm:pr-12">
                        {title}
                      </h2>

                      <section
                        aria-labelledby="information-heading"
                        className="mt-3"
                      >
                        <h3 className="sr-only" id="information-heading">
                          {t("itemInformation")}
                        </h3>

                        <p className="font-body text-2xl text-gray-900">
                          {formatPrice(price / exchangeRate, currency)}
                        </p>

                        <div className="mt-6">
                          <h4 className="sr-only">{t("itemDescription")}</h4>

                          <p className="text-sm text-gray-700">
                            {item.description}
                          </p>

                          <div className="mt-6">
                            <label className="mb-2 block w-full text-sm font-semibold text-gray-700">
                              {t("quantity.label")}
                            </label>
                            <QuantityInput
                              max={item.stock}
                              onChange={setQuantity}
                              value={quantity}
                            />
                          </div>
                        </div>
                      </section>

                      <Button
                        className="mt-6 w-full"
                        disabled={item.stock === 0}
                        onClick={handleAddToCart}
                        size="lg"
                      >
                        {item.stock === 0 ? t("outOfStock") : t("addToCart")}
                      </Button>
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
