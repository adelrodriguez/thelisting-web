import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import type { Item } from "@prisma/client"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { Fragment, useState } from "react"

import { Button } from "~/components/common"
import { FormattedNumber } from "~/components/common"
import { QuantityInput } from "~/components/registry"
import prisma from "~/helpers/prisma.server"
import { useCart, useProduct } from "~/utils/hooks"
import { getPriceSymbol } from "~/utils/money"
import type { LoaderResult } from "~/utils/remix"
import { goToParent } from "~/utils/remix"

export async function loader({
  params,
}: LoaderArgs): Promise<LoaderResult<Item>> {
  const id = params.item

  try {
    const item = await prisma.item.findFirst({
      where: { id },
    })

    if (!item) {
      return goToParent()
    }

    return json(item)
  } catch (error) {
    return goToParent()
  }
}

export function CatchBoundary() {
  return <div>Item not found</div>
}

export default function ListingItemDetailPage() {
  const { add } = useCart()
  const item = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useProduct(item.commerceId ?? "")
  const [open, setOpen] = useState(true)
  const [quantity, setQuantity] = useState(!item.available ? 0 : 1)

  // TODO(adelrodriguez): Handle loading and error states
  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error!</div>

  const price = data.product?.variants.nodes[0]?.price!
  const variantId = data.product?.variants.nodes[0]?.id!

  return (
    <Transition.Root appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => navigate("../")}
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
              afterLeave={() => navigate("../")}
            >
              <Dialog.Panel className="flex w-full transform text-left text-base transition md:my-8 md:max-w-2xl md:px-4 lg:max-w-4xl">
                <div className="relative flex w-full items-center overflow-hidden bg-white px-4 pt-14 pb-8 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
                  <button
                    type="button"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 sm:top-8 sm:right-6 md:top-6 md:right-6 lg:top-8 lg:right-8"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  <div className="grid w-full grid-cols-1 items-start gap-y-8 gap-x-6 sm:grid-cols-12 lg:gap-x-8">
                    <div className="sm:col-span-4 lg:col-span-5">
                      <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={data?.product?.variants.nodes[0]?.image?.url}
                          alt={data?.product?.title}
                          className="object-cover object-center"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-8 lg:col-span-7">
                      <h2 className="text-2xl font-bold text-gray-900 sm:pr-12">
                        {item.title}
                      </h2>

                      <section
                        aria-labelledby="information-heading"
                        className="mt-3"
                      >
                        <h3 id="information-heading" className="sr-only">
                          Item information
                        </h3>

                        <p className="text-2xl text-gray-900">
                          <FormattedNumber
                            prefix={getPriceSymbol(price.currencyCode)}
                            thousands
                            decimals={2}
                          >
                            {price.amount}
                          </FormattedNumber>
                        </p>

                        <div className="mt-6">
                          <h4 className="sr-only">Description</h4>

                          <p className="text-sm text-gray-700">
                            {item.description}
                          </p>

                          <div className="mt-6">
                            <QuantityInput
                              onChange={setQuantity}
                              max={item.available}
                              value={quantity}
                            />
                          </div>
                        </div>
                      </section>

                      <Button
                        size="lg"
                        className="mt-6 w-full"
                        onClick={() => {
                          add(
                            { ...item, price: price.amount, variantId },
                            quantity
                          )
                          setOpen(false)
                        }}
                        disabled={item.available === 0}
                      >
                        {item.available === 0 ? "Out of stock" : "Add to cart"}
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
