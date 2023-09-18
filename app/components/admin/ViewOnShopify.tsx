import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid"
import { Link } from "@remix-run/react"
import { ClientOnly } from "remix-utils"

import { Spinner } from "~/components/loading"

export default function ViewOnShopify({ id }: { id: string }) {
  const split = id.split("/")
  const numberId = split[split.length - 1]
  const entity = split[split.length - 2]?.toLowerCase()

  return (
    <ClientOnly fallback={<Spinner />}>
      {() => (
        <Link
          className="flex items-center gap-2 font-medium hover:underline"
          target="_blank"
          to={`https://admin.shopify.com/store/${window.env.shopifyStore}/${entity}s/${numberId}`}
        >
          View on Shopify{" "}
          <ArrowTopRightOnSquareIcon className="inline-block h-4 w-4" />
        </Link>
      )}
    </ClientOnly>
  )
}
