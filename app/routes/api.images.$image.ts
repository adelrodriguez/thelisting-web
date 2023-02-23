import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

import prisma from "~/helpers/prisma.server"
import { getParam } from "~/utils/remix"

export async function loader({ request, params }: LoaderArgs) {
  const imageId = getParam(params, "image")

  const image = await prisma.image.findFirst({
    where: {
      id: imageId,
    },
  })

  return json(image)
}
