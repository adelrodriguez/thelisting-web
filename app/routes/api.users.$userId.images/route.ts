import { type LoaderFunctionArgs, json } from "@remix-run/node"

import auth from "~/helpers/auth.server"
import { generateAssetUrl } from "~/utils/asset.server"
import { unauthorized } from "~/utils/http"

export async function loader({ context, request }: LoaderFunctionArgs) {
  const db = context.db

  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized({ message: "You must be logged in to view images" })
  }

  const assets = await db.asset.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      filename: true,
      id: true,
      name: true,
      service: true,
    },
    where: {
      mimeType: {
        startsWith: "image/",
      },
      ownerId: user.id,
    },
    // TODO(adelrodriguez): Add pagination
  })

  const images = assets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    url: generateAssetUrl(asset.service, user.id, asset.filename),
  }))

  return json(images)
}
