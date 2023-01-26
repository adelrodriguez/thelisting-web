import { RemixBrowser } from "@remix-run/react"
import { useLocation, useMatches } from "@remix-run/react"
import * as Sentry from "@sentry/remix"
import { startTransition, StrictMode, useEffect } from "react"
import { hydrateRoot } from "react-dom/client"

import { isProduction } from "~/config/vars"

function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>
    )
  })
}

Sentry.init({
  dsn: isProduction
    ? "https://0477a064aae041fcb5241599ca5b8935:715c0c4d64f441ce8f2a0f1a60ce40c5@o4504418880782336.ingest.sentry.io/4504418883338240"
    : undefined,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.remixRouterInstrumentation(
        useEffect,
        useLocation,
        useMatches
      ),
    }),
  ],
  tracesSampleRate: 1,
})

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate)
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1)
}
