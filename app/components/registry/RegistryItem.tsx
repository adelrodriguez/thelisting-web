import type { Item } from "@prisma/client"
import { Link } from "@remix-run/react"
import * as Sentry from "@sentry/remix"
import { flattenConnection } from "@shopify/storefront-kit-react"
import clsx from "clsx"

import { FormattedNumber, Image } from "~/components/common"
import { useProduct } from "~/utils/hooks"
import { getPriceSymbol } from "~/utils/money"

export default function RegistryItem({
  id,
  commerceId,
  available,
}: {
  id: Item["id"]
  commerceId: string
  available: boolean
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
    <Link className="group font-body" to={id} preventScrollReset>
      <div className="relative">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-sm sm:rounded-md xl:aspect-w-7 xl:aspect-h-8">
          <Image
            src={data?.product?.variants.nodes[0]?.image?.url}
            alt={title}
            className={clsx("h-full w-full object-cover object-center", {
              "group-hover:opacity-75": available,
              "opacity-50": !available,
            })}
          />
        </div>
        {!available && (
          <span className="absolute bottom-0 left-0 z-10 inline-flex items-center rounded-full bg-gray-700 px-3 py-0.5 text-sm lg:px-4 lg:py-1 lg:text-base font-medium text-white mb-4 ml-4">
            ✨ Gifted
          </span>
        )}
      </div>

      <h3 className="mt-4 text-base text-gray-700">{title}</h3>
      <p className="mt-1 text-lg text-gray-700 font-medium">
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
