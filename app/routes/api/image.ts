import type { LoaderArgs } from "@remix-run/server-runtime"
import { imageLoader, MemoryCache } from "remix-image/server"

const config = {
  cache: new MemoryCache(),
  selfUrl: "http://localhost:3000",
}

export function loader({ request }: LoaderArgs): Promise<Response> {
  return imageLoader(config, request)
}
