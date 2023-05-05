import type { LoaderArgs } from "@remix-run/node"
import { sharpTransformer } from "remix-image-sharp"
import { fetchResolver, imageLoader } from "remix-image/server"

import { ImageCache } from "~/utils/image.server"

export function loader({ request, context }: LoaderArgs) {
  const cache = context.cache
  let url = new URL("/", request.url)

  return imageLoader(
    {
      cache: new ImageCache(cache),
      resolver: async (asset, url, options, basePath) => {
        return await fetchResolver(asset, url, options, basePath)
      },
      selfUrl: url.href,
      transformer: sharpTransformer,
    },
    request
  )
}
