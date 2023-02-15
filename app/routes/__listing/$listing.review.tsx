import { Disclosure } from "@headlessui/react"
import { ListingStatus } from "@prisma/client"
import type { LoaderArgs } from "@remix-run/node"
import { intlFormat } from "date-fns"
import { useTranslation } from "react-i18next"
import { notFound } from "remix-utils"

import { Button, FormattedNumber } from "~/components/common"
import { OrderItem } from "~/components/registry"
import prisma from "~/helpers/prisma.server"
import { getPriceSymbol } from "~/utils/money"
import { getParam, json, useLoaderData } from "~/utils/remix"

export const handle = {
  i18n: ["common", "listing"],
}

export async function loader({ params }: LoaderArgs) {
  const path = getParam(params, "listing")

  const listing = await prisma.listing.findUnique({
    select: {
      purchases: {
        include: {
          customer: true,
          itemPurchases: {
            include: {
              item: true,
            },
          },
          note: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      status: true,
      title: true,
    },
    where: { path },
  })

  if (!listing || listing.status !== ListingStatus.Published) {
    throw notFound("The listing you are looking for does not exist.")
  }

  return json({ listing })
}

export default function ListingReviewPage() {
  const { listing } = useLoaderData<typeof loader>()
  const { t, i18n } = useTranslation(handle.i18n)

  return (
    <main className="relative lg:min-h-full">
      <div className="h-32 overflow-hidden lg:fixed lg:h-full lg:w-1/3 lg:pr-4 xl:pr-12">
        <img
          src="https://images.unsplash.com/photo-1589948516895-db76617cb753?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3024&q=80"
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div>
        <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:grid lg:max-w-full lg:grid-cols-3">
          <div className="lg:col-span-2 lg:col-start-2">
            <div className="mx-auto max-w-7xl sm:px-2 lg:px-8">
              <div className="mx-auto max-w-2xl px-4 lg:max-w-4xl lg:px-0">
                <h1 className="font-header text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                  {listing.title}
                </h1>
                <p className="text-md mt-2 font-body text-gray-500">
                  {t("listing:yourGiftsDescription")}
                </p>
              </div>

              <div className="mt-16">
                <div className="mx-auto max-w-2xl space-y-8 sm:px-4 lg:max-w-4xl lg:px-0">
                  {listing.purchases.map((purchase, index) => (
                    <Disclosure key={purchase.id} defaultOpen={index === 0}>
                      {({ open }) => (
                        <div className="border-t border-b border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border">
                          <div className="flex flex-col items-center justify-between border-b border-gray-200 p-4 sm:flex-row">
                            <dl className="grid w-full grid-cols-3 gap-y-2 gap-x-6 text-sm sm:w-3/4">
                              <div>
                                <dt className="font-medium text-gray-900">
                                  {t("listing:giftedBy")}
                                </dt>
                                <dd className="mt-1 max-w-[200px] text-gray-500">
                                  {purchase.customer?.name}
                                </dd>
                              </div>
                              <div>
                                <dt className="font-medium text-gray-900">
                                  {t("listing:giftedOn")}
                                </dt>
                                <dd className="mt-1 text-gray-500">
                                  <time
                                    dateTime={purchase.createdAt.toDateString()}
                                  >
                                    {intlFormat(
                                      purchase.createdAt,
                                      {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      },
                                      { locale: i18n.language }
                                    )}
                                  </time>
                                </dd>
                              </div>
                              <div>
                                <dt className="font-medium text-gray-900">
                                  {t("listing:totalGifted")}
                                </dt>
                                <dd className="mt-1 text-gray-500">
                                  <FormattedNumber
                                    prefix={getPriceSymbol("DOP")}
                                    thousands
                                    decimals={2}
                                  >
                                    {purchase.cost}
                                  </FormattedNumber>
                                </dd>
                              </div>
                            </dl>

                            <Disclosure.Button
                              as="div"
                              className="mt-4 w-full sm:mt-0 sm:w-auto"
                            >
                              <Button
                                variant="secondary"
                                className="w-full sm:w-auto"
                              >
                                {open
                                  ? t("common:close")
                                  : t("common:viewDetails")}
                              </Button>
                            </Disclosure.Button>
                          </div>

                          {/* Products */}
                          <Disclosure.Panel>
                            <h4 className="sr-only">Items</h4>
                            <ul className="ui-open:divide-y ui-open:divide-gray-200">
                              {purchase.itemPurchases.map((itemPurchase) => (
                                <li
                                  key={itemPurchase.itemId}
                                  className="text-medium p-4 sm:p-6"
                                >
                                  <OrderItem
                                    commerceId={itemPurchase.item.commerceId}
                                    quantity={itemPurchase.quantity}
                                    cost={itemPurchase.cost}
                                  />
                                </li>
                              ))}
                            </ul>
                            {purchase.note && (
                              <div className="p-4">
                                <div className="text-sm font-medium text-gray-900">
                                  ✨{" "}
                                  {t("listing:leftYouANote", {
                                    name: purchase.customer?.name,
                                  })}
                                </div>
                                <blockquote>
                                  <p className="mt-1 text-sm text-gray-500">
                                    {purchase.note?.text}
                                  </p>
                                </blockquote>
                              </div>
                            )}
                          </Disclosure.Panel>
                        </div>
                      )}
                    </Disclosure>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
