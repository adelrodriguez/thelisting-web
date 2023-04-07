import { RibbonType } from "@prisma/client"
import { UserRole } from "@prisma/client"
import type { ActionArgs } from "@remix-run/node"
import { notFound, unauthorized } from "remix-utils"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/helpers/auth.server"
import { BannerPropertiesSchema } from "~/utils/ribbon"

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

  const ribbon = await db.ribbon.findUnique({ where: { id: ribbonId } })

  if (!ribbon) {
    return notFound("No ribbon found")
  }

  switch (ribbon.type) {
    case RibbonType.Banner: {
      const properties = await zx.parseForm(request, BannerPropertiesSchema)

      const ribbon = await db.ribbon.update({
        data: { properties },
        where: { id: ribbonId },
      })
      return ribbon
    }
    default: {
      return null
    }
  }
}
