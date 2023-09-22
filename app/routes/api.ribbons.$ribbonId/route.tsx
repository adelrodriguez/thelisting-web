import { UserRole } from "@prisma/client"
import type { ActionFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/helpers/auth.server"
import { notAllowed, unauthorized } from "~/utils/remix"

export async function action({ params, request, context }: ActionFunctionArgs) {
  const { db } = context
  const { ribbonId } = zx.parseParams(params, { ribbonId: z.string() })
  const user = await auth.isAuthenticated(request)

  if (!user) {
    return unauthorized({ message: "You must be logged in to edit a ribbon" })
  }

  if (user.role !== UserRole.Admin) {
    return unauthorized({ message: "You must be an admin to edit a ribbon" })
  }

  switch (request.method) {
    case "DELETE": {
      const ribbon = await db.ribbon.delete({
        where: { id: ribbonId },
      })
      return json({ ribbon })
    }
    default:
      throw notAllowed()
  }
}
