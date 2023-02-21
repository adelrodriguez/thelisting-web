import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

import auth from "~/helpers/auth.server"
import prisma from "~/helpers/prisma.server"
import { Unauthorized } from "~/utils/http.server"
import { getParam } from "~/utils/remix"

export async function loader({ request, params }: LoaderArgs) {
  const user = await auth.isAuthenticated(request)

  if (!user) {
    return Unauthorized
  }

  const imageId = getParam(params, "image")

  const image = await prisma.image.findFirst({
    where: {
      id: imageId,
      userId: user.id,
    },
  })

  return json(image)
}
