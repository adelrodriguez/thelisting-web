import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/helpers/auth.server"
import { generateAssetUrl } from "~/utils/asset.server"
import { notFound, unauthorized } from "~/utils/http"

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const db = context.db

  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized({ message: "You must be logged in to view images" })
  }

  const { assetId } = zx.parseParams(params, { assetId: z.string() })

  const asset = await db.asset.findFirst({
    where: { id: assetId, ownerId: user.id },
  })

  if (!asset) {
    throw notFound({ title: "Object not found" })
  }

  return json({
    ...asset,
    url: generateAssetUrl(asset.service, asset.ownerId, asset.filename),
  })
}
