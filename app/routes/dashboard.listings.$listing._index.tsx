import type { LoaderArgs } from "@remix-run/node"
import { StatusCodes } from "http-status-codes"
import { z } from "zod"
import { zx } from "zodix"

import { redirect } from "~/utils/remix"

export function loader({ params }: LoaderArgs) {
  const { listing } = zx.parseParams(params, {
    listing: z.string(),
  })

  return redirect(`/dashboard/listings/${listing}/stats`, {
    status: StatusCodes.MOVED_PERMANENTLY,
  })
}
