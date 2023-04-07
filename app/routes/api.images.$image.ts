import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

import { getParam } from "~/utils/remix"

export async function loader({ params, context }: LoaderArgs) {
  const db = context.db
  const imageId = getParam(params, "image")

  const image = await db.image.findFirst({
    where: {
      id: imageId,
    },
  })

  return json(image)
}
