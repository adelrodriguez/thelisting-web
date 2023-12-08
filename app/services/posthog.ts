import { useLocation } from "@remix-run/react"
import posthog from "posthog-js"
import { useEffect } from "react"

import { isProduction } from "~/config/vars"

export function usePostHog(apiKey: string, host: string) {
  useEffect(() => {
    posthog.init(apiKey, {
      api_host: host,
      autocapture: isProduction,
      capture_pageview: false,
    })
  }, [apiKey, host])
}

export function useCapturePageview() {
  const location = useLocation()

  useEffect(() => {
    posthog.capture("$pageview")
  }, [location])
}
