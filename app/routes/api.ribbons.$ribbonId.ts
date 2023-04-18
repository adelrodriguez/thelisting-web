import { RibbonType } from "@prisma/client"
import { UserRole } from "@prisma/client"
import type { ActionArgs } from "@remix-run/node"
import { unauthorized } from "remix-utils"
import { validationError } from "remix-validated-form"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/helpers/auth.server"
import { BannerPropertiesSchema } from "~/utils/ribbons"

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

  const data = await request.formData()
  const type = data.get("type") as RibbonType

  switch (type) {
    case RibbonType.Banner: {
      const properties = await zx.parseForm(data, BannerPropertiesSchema)

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
