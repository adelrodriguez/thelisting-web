import type { LoaderArgs } from "@remix-run/server-runtime"
import { sharpTransformer } from "remix-image-sharp"
import { fetchResolver, imageLoader } from "remix-image/server"

import { ImageCache } from "~/utils/image"

export function loader({ request }: LoaderArgs) {
  let url = new URL("/", request.url)

  return imageLoader(
    {
      cache: new ImageCache(),
      resolver: async (asset, url, options, basePath) => {
        return await fetchResolver(asset, url, options, basePath)
      },
      selfUrl: url.href,
      transformer: sharpTransformer,
    },
    request
  )
}
