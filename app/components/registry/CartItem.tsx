import type { Item } from "@prisma/client"
import type { ReactElement } from "react"
import { Link } from "react-router-dom"

import { FormattedNumber } from "~/components/common"
import { useCart, useProduct } from "~/utils/hooks"
import { getPriceSymbol } from "~/utils/money"

export default function CartItem({
  commerceId,
  id,
  title,
  quantity,
}: Pick<Item, "id" | "commerceId" | "title"> & {
  quantity: number
}): ReactElement {
  const { data } = useProduct(commerceId!)
  const { remove } = useCart()

  // TODO(adelrodriguez): Handle loading and error states
  if (!data) return <div>Loading...</div>

  const image = data.product?.variants.nodes[0]?.image!
  const price = data.product?.variants.nodes[0]?.price!

  return (
    <>
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          src={image.url}
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
                prefix={getPriceSymbol(price.currencyCode)}
                thousands
                decimals={2}
              >
                {price.amount}
              </FormattedNumber>
            </p>
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <p className="text-gray-500">Qty {quantity}</p>

          <div className="flex">
            <button
              type="button"
              className="font-medium text-gray-600 hover:text-gray-500"
              onClick={() => remove(id)}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
