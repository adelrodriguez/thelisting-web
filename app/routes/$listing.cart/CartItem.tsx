import type { Item } from "@prisma/client"
import { Link, useParams } from "@remix-run/react"
import posthog from "posthog-js"
import { useTranslation } from "react-i18next"
import type { RouteParams } from "routes-gen"
import { route } from "routes-gen"

import { Alert } from "~/components/common"
import { useCart, useExchangeRate, useProduct } from "~/utils/hooks"
import { formatPrice } from "~/utils/money"

export default function CartItem({
  commerceId,
  id,
  quantity,
  sku,
}: Pick<Item, "id" | "commerceId" | "quantity" | "sku">) {
  const { listing } = useParams<RouteParams["/:listing/cart"]>()
  const { data, isError, isPending } = useProduct(commerceId!)
  const cart = useCart()
  const { t } = useTranslation("registry")
  const { currency, exchangeRate } = useExchangeRate()

  // TODO(adelrodriguez): Handle loading and error states
  if (isPending) return <div>Loading...</div>

  if (isError || !listing)
    return (
      <div className="w-full">
        <Alert onClose={() => cart.remove(id)} type="error">
          Error loading product
        </Alert>
      </div>
    )

  const { imageUrl, price, title } = data

  return (
    <>
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          alt={title}
          className="h-full w-full object-cover object-center"
          src={imageUrl}
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>
              <Link to={route("/:listing/:item", { item: sku, listing })}>
                {title}
              </Link>
            </h3>
            <p className="ml-4">
              {formatPrice(price / exchangeRate, currency)}
            </p>
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <p className="text-gray-500">
            {t("quantity.abbreviation")} {quantity}
          </p>

          <div className="flex">
            <button
              className="font-medium text-gray-600 hover:text-gray-500"
              onClick={() => {
                cart.remove(id)

                posthog.capture("item_removed", { id, price, quantity, sku })
              }}
              type="button"
            >
              {t("quantity.remove")}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
