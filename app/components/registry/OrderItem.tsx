import type { Item } from "@prisma/client"

import { FormattedNumber, Image } from "~/components/common"
import { useProduct } from "~/utils/hooks"
import { getPriceSymbol } from "~/utils/money"

export default function OrderItem({
  commerceId,
  quantity,
}: {
  commerceId: Item["commerceId"]
  quantity: number
}) {
  const { data, isLoading, isError } = useProduct(commerceId!)

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error</div>

  const { title, imageUrl, currencyCode, price } = data

  return (
    <>
      <Image
        src={imageUrl}
        alt={title}
        className="h-24 w-24 flex-none rounded-md bg-gray-100 object-cover object-center"
      />
      <div className="flex-auto space-y-1">
        <h3 className="text-gray-900">{title}</h3>
        <p>Quantity: {quantity}</p>
      </div>
      <p className="flex-none font-medium text-gray-900">
        <FormattedNumber
          prefix={getPriceSymbol(currencyCode)}
          thousands
          decimals={2}
        >
          {price * quantity}
        </FormattedNumber>
      </p>
    </>
  )
}
