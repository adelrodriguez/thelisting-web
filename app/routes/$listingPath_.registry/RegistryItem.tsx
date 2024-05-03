import type { Item } from "@prisma/client"
import { Link, useLocation } from "@remix-run/react"
import clsx from "clsx"
import { useTranslation } from "react-i18next"

import { useExchangeRate } from "~/utils/hooks"
import { formatPrice } from "~/utils/money"

export default function RegistryItem({
  imageUrl,
  price,
  sku,
  stock,
  title,
}: {
  sku: Item["sku"]
  stock: number
  title: string
  imageUrl: string
  price: number
}) {
  const { t } = useTranslation("registry")
  const location = useLocation()
  const { currency, exchangeRate } = useExchangeRate()
  const isAvailable = stock > 0

  return (
    <Link className="group text-center font-body" preventScrollReset to={sku + location.search}>
      <div className="relative">
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-sm xl:aspect-h-8 xl:aspect-w-7 sm:rounded-md">
          <img
            alt={title}
            className={clsx("h-full w-full object-cover object-center", {
              "group-hover:opacity-75": isAvailable,
              "opacity-50": !isAvailable,
            })}
            loading="lazy"
            src={imageUrl}
          />
        </div>
        {!isAvailable && (
          <span className="absolute bottom-0 left-0 z-10 mb-4 ml-4 inline-flex items-center rounded-full bg-gray-700 px-3 py-0.5 text-sm font-medium text-white lg:px-4 lg:py-1 lg:text-base">
            {t("out_of_stock")}
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
