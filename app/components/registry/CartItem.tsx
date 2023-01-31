import type { Item } from "@prisma/client"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { FormattedNumber } from "~/components/common"
import { useCart, useProduct } from "~/utils/hooks"
import { getPriceSymbol } from "~/utils/money"

export default function CartItem({
  commerceId,
  id,
  quantity,
}: Pick<Item, "id" | "commerceId" | "quantity">) {
  const { data } = useProduct(commerceId!)
  const cart = useCart()
  const { t } = useTranslation("listing")

  // TODO(adelrodriguez): Handle loading and error states
  if (!data) return <div>Loading...</div>

  const { title, price, imageUrl, currencyCode } = data

  return (
    <>
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>
              <Link to={`../${id}`}>{title}</Link>
            </h3>
            <p className="ml-4">
              <FormattedNumber
                prefix={getPriceSymbol(currencyCode)}
                thousands
                decimals={2}
              >
                {price}
              </FormattedNumber>
            </p>
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <p className="text-gray-500">
            {t("quantity.abbreviation")} {quantity}
          </p>

          <div className="flex">
            <button
              type="button"
              className="font-medium text-gray-600 hover:text-gray-500"
              onClick={() => cart.remove(id)}
            >
              {t("quantity.remove")}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
