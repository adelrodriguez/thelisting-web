import type { LoaderFunctionArgs } from "@remix-run/node"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/helpers/auth.server"
import { badRequest, unauthorized } from "~/utils/remix"

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized()
  }

  const { url: imageUrl } = zx.parseQuery(request, { url: z.string() })

  if (!imageUrl) {
    throw badRequest({ message: "Missing url parameter" })
  }

  const res = await fetch(imageUrl)
  const contentType = res.headers.get("Content-Type")
  const reader = res.body?.getReader()

  if (!reader) {
    throw badRequest({ message: "Missing body" })
  }

  if (!contentType) {
    throw badRequest({ message: "Missing Content-Type header" })
  }

  const response = new ReadableStream({
    start: async (controller) => {
      for (;;) {
        const { done, value } = await reader.read()

        // When no more data needs to be consumed, break the reading
        if (done) {
          break
        }

        // Enqueue the next data chunk into our target stream
        controller.enqueue(value)
      }

      // Close the stream
      controller.close()
      reader.releaseLock()
    },
  })

  return new Response(response, {
    headers: {
      "Content-Type": contentType,
    },
  })
}
