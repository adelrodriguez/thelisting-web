import { Disclosure } from "@headlessui/react"
import { GiftIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid"
import { ListingStatus } from "@prisma/client"
import type { LoaderArgs } from "@remix-run/node"
import currency from "currency.js"
import { intlFormat } from "date-fns"
import { useTranslation } from "react-i18next"
import { notFound } from "remix-utils"

import { Button, FormattedNumber } from "~/components/common"
import { OrderItem } from "~/components/registry"
import i18next from "~/helpers/i18next.server"
import { useTrackPageview } from "~/utils/hooks"
import { getPriceSymbol } from "~/utils/money"
import { getParam, json, useLoaderData } from "~/utils/remix"

export const handle = {
  i18n: ["common", "registry"],
}

export async function loader({ request, params, context }: LoaderArgs) {
  const db = context.db
  const path = getParam(params, "listing")
  const t = await i18next.getFixedT(request, "registry")

  const listing = await db.listing.findUnique({
    select: {
      id: true,
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
        where: {
          paid: true,
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

  const totalPurchased = listing.purchases.reduce(
    (total, purchase) => total + purchase.cost,
    0
  )
  const itemsPurchased = listing.purchases.reduce(
    (total, purchase) => total + purchase.itemPurchases.length,
    0
  )

  return json({
    listing,
    stats: [
      { icon: "gift", name: t("itemsGifted"), stat: itemsPurchased },
      {
        icon: "currency",
        name: t("totalGifted"),
        stat: currency(totalPurchased)
          .format({ symbol: getPriceSymbol() })
          .toString(),
      },
    ],
  })
}

export default function ListingReviewPage() {
  const { listing, stats } = useLoaderData<typeof loader>()
  const { t, i18n } = useTranslation(handle.i18n)

  useTrackPageview({ listingId: listing.id })

  return (
    <main className="relative lg:min-h-full">
      <div className="h-48 overflow-hidden lg:fixed lg:h-full lg:w-1/3 lg:pr-4 xl:pr-12">
        <img
          src="https://imagedelivery.net/wHwwAqNxbuESOwdHNE6NsQ/beaf377b-e29a-41b7-0c21-220601d67c00/display"
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

              <section className="mt-5 px-5">
                <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {stats.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
                    >
                      <div className="h-fit w-fit rounded-md bg-slate-500 p-3">
                        {item.icon === "currency" && (
                          <CurrencyDollarIcon
                            className="h-6 w-6 text-white"
                            aria-hidden="true"
                          />
                        )}
                        {item.icon === "gift" && (
                          <GiftIcon
                            className="h-6 w-6 text-white"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className="ml-4">
                        <dt className="truncate text-sm font-medium text-gray-500">
                          {item.name}
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                          {item.stat}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </section>

              <div className="mt-16">
                <div className="mx-auto max-w-2xl space-y-8 sm:px-4 lg:max-w-4xl lg:px-0">
                  {listing.purchases.length === 0 && (
                    <h2 className="px-4 py-5 text-center font-body text-lg font-medium text-gray-500 sm:px-6">
                      {t("listing:yourGiftsEmpty")}
                    </h2>
                  )}
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
