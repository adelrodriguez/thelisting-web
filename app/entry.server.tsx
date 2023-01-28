import type { EntryContext } from "@remix-run/node"
import { Response } from "@remix-run/node"
import { RemixServer } from "@remix-run/react"
import * as Sentry from "@sentry/remix"
import { createInstance } from "i18next"
import Backend from "i18next-fs-backend"
import isbot from "isbot"
import { resolve } from "node:path"
import { renderToPipeableStream } from "react-dom/server"
import { I18nextProvider, initReactI18next } from "react-i18next"
import { PassThrough } from "stream"

import { SENTRY_DSN } from "~/config/env.server"
import { isProduction } from "~/config/vars"
import i18next from "~/helpers/i18next.server"
import prisma from "~/helpers/prisma.server"
import i18n from "~/i18n"

const ABORT_DELAY = 5000

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const instance = createInstance()
  const lng = await i18next.getLocale(request)
  const ns = i18next.getRouteNamespaces(remixContext)

  await instance
    .use(initReactI18next) // Tell our instance to use react-i18next
    .use(Backend) // Setup our backend
    .init({
      ...i18n, // spread the configuration
      backend: { loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json") },
      lng, // The locale we detected above
      ns, // The namespaces the routes about to render wants to use
    })

  return isbot(request.headers.get("user-agent"))
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
        instance
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
        instance
      )
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  i18nInstance: ReturnType<typeof createInstance>
) {
  return new Promise((resolve, reject) => {
    let didError = false

    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={i18nInstance}>
        <RemixServer context={remixContext} url={request.url} />\
      </I18nextProvider>,
      {
        onAllReady() {
          const body = new PassThrough()

          responseHeaders.set("Content-Type", "text/html")

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          )

          pipe(body)
        },
        onError(error: unknown) {
          didError = true

          // eslint-disable-next-line no-console
          console.error(error)
        },
        onShellError(error: unknown) {
          reject(error)
        },
      }
    )

    setTimeout(abort, ABORT_DELAY)
  })
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  i18nInstance: ReturnType<typeof createInstance>
) {
  return new Promise((resolve, reject) => {
    let didError = false

    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={i18nInstance}>
        <RemixServer context={remixContext} url={request.url} />
      </I18nextProvider>,
      {
        onError(error: unknown) {
          didError = true

          // eslint-disable-next-line no-console
          console.error(error)
        },
        onShellError(err: unknown) {
          reject(err)
        },
        onShellReady() {
          const body = new PassThrough()

          responseHeaders.set("Content-Type", "text/html")

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          )

          pipe(body)
        },
      }
    )

    setTimeout(abort, ABORT_DELAY)
  })
}

Sentry.init({
  dsn: isProduction ? SENTRY_DSN : undefined,
  environment: process.env.NODE_ENV,
  integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
  tracesSampleRate: 1,
})
