import { RemixBrowser } from "@remix-run/react"
import { useLocation, useMatches } from "@remix-run/react"
import i18next from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import Backend from "i18next-http-backend"
import { startTransition, StrictMode, useEffect } from "react"
import { hydrateRoot } from "react-dom/client"
import { I18nextProvider, initReactI18next } from "react-i18next"
import { getInitialNamespaces } from "remix-i18next"

import { isProduction } from "~/config/vars"
import i18n from "~/i18n"
import Sentry from "~/services/sentry"

async function hydrate() {
  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(Backend)
    .init({
      ...i18n,
      detection: {
        order: ["htmlTag"],
      },
      ns: getInitialNamespaces(),
    })

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <RemixBrowser />
        </StrictMode>
      </I18nextProvider>
    )
  })
}

Sentry.init({
  dist: "client",
  dsn: window.env.sentryDsn,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.remixRouterInstrumentation(
        useEffect,
        useLocation,
        useMatches
      ),
    }),
    new Sentry.Replay(),
  ],
  release: window.env.release,
  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: isProduction ? 0.1 : 1.0,
  tracesSampleRate: 1,
})

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate)
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1)
}
