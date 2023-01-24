import type { Item } from "@prisma/client"
import { Link } from "@remix-run/react"
import * as Sentry from "@sentry/remix"
import { flattenConnection } from "@shopify/storefront-kit-react"

import { FormattedNumber, Image } from "~/components/common"
import { useProduct } from "~/utils/hooks"
import { getPriceSymbol } from "~/utils/money"

export default function RegistryItem({
  id,
  commerceId,
}: {
  id: Item["id"]
  commerceId: string
}) {
  const { data, isLoading, isError, error } = useProduct(commerceId)

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden sm:rounded-lg xl:aspect-w-7 xl:aspect-h-8">
          <div className="h-full w-full bg-gray-200" />
        </div>
        <div className="mt-4 space-y-4">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    Sentry.captureException(error)

    return null
  }

  const title = data?.product?.title!
  const variant = flattenConnection(data?.product?.variants)[0]
  const price = variant?.price!

  return (
    <Link className="group" to={id}>
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg sm:rounded-lg xl:aspect-w-7 xl:aspect-h-8">
        <Image
          src={data?.product?.variants.nodes[0]?.image?.url}
          alt={title}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
        />
      </div>
      <h3 className="mt-4 text-sm text-gray-700">{title}</h3>
      <p className="mt-1 text-md font-medium text-gray-900">
        <FormattedNumber
          prefix={getPriceSymbol(price.currencyCode)}
          thousands
          decimals={2}
        >
          {price.amount}
        </FormattedNumber>
      </p>
    </Link>
  )
}
