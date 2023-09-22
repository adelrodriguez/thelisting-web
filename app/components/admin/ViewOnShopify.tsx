import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid"
import { Link } from "@remix-run/react"
import { parseGid } from "@shopify/hydrogen-react"

import { Spinner } from "~/components/loading"
import { isWindowDefined } from "~/utils/window"

export default function ViewOnShopify({ gid }: { gid: string }) {
  const { id, resource } = parseGid(gid)

  if (!isWindowDefined()) {
    return <Spinner />
  }

  return (
    <Link
      className="flex items-center gap-2 font-medium hover:underline"
      target="_blank"
      to={`https://admin.shopify.com/store/${window.env.shopifyStore}/${resource}s/${id}`}
    >
      View on Shopify{" "}
      <ArrowTopRightOnSquareIcon className="inline-block h-4 w-4" />
    </Link>
  )
}
