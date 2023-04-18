import { RibbonType } from "@prisma/client"
import { UserRole } from "@prisma/client"
import type { ActionArgs } from "@remix-run/node"
import { namedAction, unauthorized } from "remix-utils"
import { validationError } from "remix-validated-form"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/helpers/auth.server"
import { json } from "~/utils/remix"

export async function action({ params, request, context }: ActionArgs) {
  const { db } = context
  const { ribbonId } = zx.parseParams(params, { ribbonId: z.string() })
  const user = await auth.isAuthenticated(request)

  if (!user) {
    return unauthorized("You must be logged in to edit a ribbon")
  }

  if (user.role !== UserRole.Admin) {
    return unauthorized("You must be an admin to edit a ribbon")
  }

  return namedAction(request, {
    async delete() {
      const ribbon = await db.ribbon.delete({
        where: { id: ribbonId },
      })
      return json({ ribbon })
    },
  })
}
