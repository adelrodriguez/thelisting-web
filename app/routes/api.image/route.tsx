import type { LoaderFunctionArgs } from "@remix-run/node"
import { sharpTransformer } from "remix-image-sharp"
import { fetchResolver, imageLoader } from "remix-image/server"

import { ImageCache } from "~/utils/image.server"

export function loader({ request, context }: LoaderFunctionArgs) {
  const cache = context.cache
  const url = new URL("/", request.url)

  return imageLoader(
    {
      cache: new ImageCache(cache),
      resolver: async (asset, url, options, basePath) => {
        return await fetchResolver(asset, url, options, basePath)
      },
      selfUrl: url.href,
      transformer: sharpTransformer,
    },
    request,
  )
}
