import { useLocation } from "@remix-run/react"
import posthog, { type CaptureOptions, type Properties } from "posthog-js"
import { useEffect } from "react"

import { isProduction } from "~/config/vars"

type Event = "cart_updated" | "checkout_started"

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

export function captureEvent(
  event: Event,
  properties?: Properties,
  options?: CaptureOptions,
) {
  posthog.capture(event, properties, options)
}
