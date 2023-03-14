import type { LoaderArgs } from "@remix-run/node"

import { StatusCodes } from "~/utils/http.server"
import { getParam, redirect } from "~/utils/remix"

export function loader({ params }: LoaderArgs) {
  const listing = getParam(params, "listing")

  return redirect(`/dashboard/listings/${listing}/stats`, {
    status: StatusCodes.MOVED_PERMANENTLY,
  })
}
