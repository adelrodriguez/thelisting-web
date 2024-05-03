import { PassThrough } from "stream"
import type { EntryContext, LoaderFunctionArgs } from "@remix-run/node"
import { createReadableStreamFromReadable } from "@remix-run/node"
import { RemixServer } from "@remix-run/react"
import * as Sentry from "@sentry/remix"
import { createInstance } from "i18next"
import isbot from "isbot"
import { renderToPipeableStream } from "react-dom/server"
import { I18nextProvider, initReactI18next } from "react-i18next"

import { NODE_ENV, SENTRY_DSN } from "~/config/env.server"
import db from "~/helpers/db.server"
import i18next from "~/helpers/i18next.server"
import i18n from "~/i18n"

const ABORT_DELAY = 5000

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const callbackName = isbot(request.headers.get("user-agent")) ? "onAllReady" : "onShellReady"

  const instance = createInstance()
  const lng = await i18next.getLocale(request)
  const ns = i18next.getRouteNamespaces(remixContext)

  await instance
    .use(initReactI18next) // Tell our instance to use react-i18next
    .init({
      ...i18n,
      lng,
      ns,
    })

  return new Promise((resolve, reject) => {
    let didError = false

    const { abort, pipe } = renderToPipeableStream(
      <I18nextProvider i18n={instance}>
        <RemixServer context={remixContext} url={request.url} />
      </I18nextProvider>,
      {
        [callbackName]() {
          const body = new PassThrough()

          responseHeaders.set("Content-Type", "text/html")

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            }),
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
      },
    )

    setTimeout(abort, ABORT_DELAY)
  })
}

export function handleError(error: unknown, { context, params, request }: LoaderFunctionArgs) {
  void Sentry.captureRemixServerException(error, "remix.server", request)

  if (error instanceof Error) {
    context.logger.error(error.message, {
      error,
      params,
      request,
    })
  } else {
    context.logger.error("Unknown error", {
      error,
      params,
      request,
    })
  }
}

Sentry.init({
  dsn: SENTRY_DSN,
  environment: NODE_ENV,
  integrations: [new Sentry.Integrations.Prisma({ client: db })],
  tracesSampleRate: 1,
})
