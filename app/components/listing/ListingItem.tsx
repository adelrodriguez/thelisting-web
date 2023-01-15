import type { Item } from "@prisma/client"
import { Link } from "@remix-run/react"
import currency from "currency.js"

import { Spinner } from "~/components/loading"
import { useProduct } from "~/utils/hooks"

export default function ListingItem({
  id,
  title,
  commerceId,
}: {
  id: Item["id"]
  title: Item["title"]
  commerceId: string
}) {
  const { data, isLoading, isError } = useProduct(commerceId)

  if (isLoading) {
    return (
      <div className="h-48 w-full aspect-w-1">
        <Spinner className="text-gray" />
      </div>
    )
  }

  if (isError) return <div>Error!</div>

  return (
    <Link className="group" to={id}>
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden sm:rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
        <img
          src={data?.product?.variants.nodes[0]?.image?.url}
          alt={data?.product?.title}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
        />
      </div>
      <h3 className="mt-4 text-sm text-gray-700">{title}</h3>
      <p className="mt-1 text-lg font-medium text-gray-900">
        {currency(data?.product?.variants.nodes[0]?.price.amount, {
          symbol: data?.product?.variants.nodes[0]?.price.currencyCode,
        }).format()}
      </p>
    </Link>
  )
}
