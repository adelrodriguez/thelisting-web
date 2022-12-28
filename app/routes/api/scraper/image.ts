import type { LoaderArgs } from "@remix-run/node"

import auth from "~/helpers/auth.server"
import { ReasonPhrases, StatusCodes } from "~/utils/http.server"

export async function loader({ request }: LoaderArgs) {
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw new Response("Must be logged in to access this resource", {
      status: StatusCodes.UNAUTHORIZED,
      statusText: ReasonPhrases.UNAUTHORIZED,
    })
  }

  const url = new URL(request.url)
  const imageUrl = url.searchParams.get("url")

  if (!imageUrl) {
    throw new Response("Missing url parameter", {
      status: StatusCodes.BAD_REQUEST,
      statusText: ReasonPhrases.BAD_REQUEST,
    })
  }

  const res = await fetch(imageUrl)
  const reader = res.body!.getReader()
  const response = new ReadableStream({
    start: async (controller) => {
      while (true) {
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
      "Content-Type": res.headers.get("Content-Type")!,
    },
  })
}
