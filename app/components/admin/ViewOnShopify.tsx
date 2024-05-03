import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid"
import { Link } from "@remix-run/react"
import { parseGid } from "@shopify/hydrogen-react"
import { useEffect, useState } from "react"

import { Spinner } from "~/components/loading"

export default function ViewOnShopify({ gid }: { gid: string }) {
  const { id, resource } = parseGid(gid)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <Spinner className="slate-700 h-4 w-4" />
  }

  return (
    <Link
      className="flex items-center gap-2 font-medium hover:underline"
      target="_blank"
      to={`https://admin.shopify.com/store/${
        window.env.shopifyStore
      }/${resource?.toLowerCase()}s/${id}`}
    >
      View on Shopify <ArrowTopRightOnSquareIcon className="inline-block h-4 w-4" />
    </Link>
  )
}
