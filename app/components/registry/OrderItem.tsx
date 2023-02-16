import type { Item } from "@prisma/client"
import { useTranslation } from "react-i18next"

import { Alert, FormattedNumber, Image } from "~/components/common"
import { useProduct } from "~/utils/hooks"
import { getPriceSymbol } from "~/utils/money"

export default function OrderItem({
  commerceId,
  quantity,
  cost,
}: {
  commerceId: Item["commerceId"]
  quantity: number
  cost?: number
}) {
  const { data, isLoading, isError } = useProduct(commerceId!)
  const { t } = useTranslation(["listing", "common"])

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex w-full gap-x-6">
          <div className="h-24 w-24 flex-none rounded-md bg-gray-200 object-cover object-center lg:h-32 lg:w-32" />
          <div className="flex-auto space-y-2">
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 w-1/3 rounded bg-gray-200" />
          </div>
          <div className="h-4 w-1/5 rounded bg-gray-200" />
        </div>
      </div>
    )
  }

  if (isError) return <Alert type="error">{t("common:error")}</Alert>

  const { title, imageUrl, currencyCode, price } = data

  return (
    <div className="flex w-full gap-x-6">
      <Image
        src={imageUrl}
        alt={title}
        className="h-24 w-24 flex-none rounded-md bg-gray-100 object-cover object-center lg:h-32 lg:w-32"
      />
      <div className="flex-auto space-y-1">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-gray-500">
          {t("quantity.label")}: {quantity}
        </p>
      </div>
      <p className="font-semibold text-gray-900">
        <FormattedNumber
          prefix={getPriceSymbol(currencyCode)}
          thousands
          decimals={2}
        >
          {(cost || price) * quantity}
        </FormattedNumber>
      </p>
    </div>
  )
}
