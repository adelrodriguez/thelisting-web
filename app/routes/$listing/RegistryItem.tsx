import type { Item } from "@prisma/client"
import { Link } from "@remix-run/react"
import clsx from "clsx"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import Sentry from "~/services/sentry"
import { useExchangeRate, useProduct } from "~/utils/hooks"
import { formatPrice } from "~/utils/money"

export default function RegistryItem({
  available,
  commerceId,
  sku,
}: {
  available: boolean
  commerceId: string
  sku: Item["sku"]
}) {
  const { data, isLoading, isError, error } = useProduct(commerceId)
  const { t } = useTranslation("registry")
  const { currency, exchangeRate } = useExchangeRate()

  useEffect(() => {
    if (isError) {
      Sentry.captureException(error)
    }
  }, [isError, error])

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden xl:aspect-h-8 xl:aspect-w-7 sm:rounded-lg">
          <div className="h-full w-full bg-gray-200" />
        </div>
        <div className="mt-4 space-y-4">
          <div className="h-4 rounded bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-1/4 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return null
  }

  const { title, imageUrl, price } = data

  return (
    <Link className="group text-center font-body" preventScrollReset to={sku}>
      <div className="relative">
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-sm xl:aspect-h-8 xl:aspect-w-7 sm:rounded-md">
          <img
            alt={title}
            className={clsx("h-full w-full object-cover object-center", {
              "group-hover:opacity-75": available,
              "opacity-50": !available,
            })}
            loading="lazy"
            src={imageUrl}
          />
        </div>
        {!available && (
          <span className="absolute bottom-0 left-0 z-10 mb-4 ml-4 inline-flex items-center rounded-full bg-gray-700 px-3 py-0.5 text-sm font-medium text-white lg:px-4 lg:py-1 lg:text-base">
            {t("outOfStock")}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-base text-gray-700">{title}</h3>
      <p className="mt-1 text-lg font-medium text-gray-700">
        {formatPrice(price / exchangeRate, currency)}
      </p>
    </Link>
  )
}
