import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { Fragment, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button, Image } from "~/components/common"
import { useCart, useProduct } from "~/utils/hooks"
import { formatPrice } from "~/utils/money"

import QuantityInput from "./QuantityInput"

export const handle = {
  i18n: "registry",
}

export async function loader({ params, context }: LoaderArgs) {
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
  const navigate = useNavigate()
  const { data, isLoading, isError } = useProduct(item.commerceId ?? "")
  const [open, setOpen] = useState(true)
  const isAvailable = item.stock > 0
  const [quantity, setQuantity] = useState(Number(isAvailable))
  const { t } = useTranslation(handle.i18n)

  // TODO(adelrodriguez): Add useDialogPage hook

  function handleAddToCart() {
    const { id, commerceId, sku } = item

    if (!commerceId) throw new Error("Item must have a commerceId")

    cart.add({ commerceId, id, price, quantity, sku, variantId })
    setOpen(false)
  }

  // TODO(adelrodriguez): Handle loading and error states
  if (isLoading) return null
  if (isError) return <div>Error!</div>

  const { title, price, variantId, imageUrl, currencyCode } = data

  return (
    <Transition.Root appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => navigate("../", { preventScrollReset: true })}
        >
          <div className="fixed inset-0 hidden bg-gray-500 bg-opacity-75 transition-opacity md:block" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
              enterTo="opacity-100 translate-y-0 md:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 md:scale-100"
              leaveTo="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
              afterLeave={() => navigate("../", { preventScrollReset: true })}
            >
              <Dialog.Panel className="flex w-full transform text-left text-base transition md:my-8 md:max-w-2xl md:px-4 lg:max-w-4xl">
                <div className="relative flex w-full items-center overflow-hidden rounded-md bg-white px-4 pt-14 pb-8 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
                  <button
                    type="button"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 sm:top-8 sm:right-6 md:top-6 md:right-6 lg:top-8 lg:right-8"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  <div className="grid w-full grid-cols-1 items-start gap-y-8 gap-x-6 sm:grid-cols-12 lg:gap-x-8">
                    <div className="sm:col-span-4 lg:col-span-5 ">
                      <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-sm bg-gray-100 sm:rounded-md">
                        <Image
                          src={imageUrl}
                          alt={title}
                          className="object-cover object-center"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-8 lg:col-span-7">
                      <h2 className="font-header text-2xl font-bold text-gray-900 sm:pr-12">
                        {title}
                      </h2>

                      <section
                        aria-labelledby="information-heading"
                        className="mt-3"
                      >
                        <h3 id="information-heading" className="sr-only">
                          {t("itemInformation")}
                        </h3>

                        <p className="font-body text-2xl text-gray-900">
                          {formatPrice(price, currencyCode)}
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
                              onChange={setQuantity}
                              max={item.stock}
                              value={quantity}
                            />
                          </div>
                        </div>
                      </section>

                      <Button
                        size="lg"
                        className="mt-6 w-full"
                        onClick={handleAddToCart}
                        disabled={item.stock === 0}
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
