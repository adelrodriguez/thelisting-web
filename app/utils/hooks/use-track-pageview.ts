import { useLocation } from "@remix-run/react"
import { useEffect } from "react"

import * as gtag from "~/utils/gtag.client"

export default function useTrackPageview(parameters?: Record<string, string>) {
  const { pathname, search } = useLocation()

  useEffect(() => {
    gtag.pageview({
      page_path: pathname,
      search,
      ...parameters,
    })
  }, [pathname, search, parameters])
}
