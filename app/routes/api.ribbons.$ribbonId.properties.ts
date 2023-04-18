import { RibbonType } from "@prisma/client"
import { UserRole } from "@prisma/client"
import type { ActionArgs } from "@remix-run/node"
import { withZod } from "@remix-validated-form/with-zod"
import { notFound, unauthorized } from "remix-utils"
import { validationError } from "remix-validated-form"
import { z } from "zod"
import { zx } from "zodix"

import auth from "~/helpers/auth.server"
import { json } from "~/utils/remix"
import {
  BannerPropertiesSchema,
  CountdownPropertiesSchema,
  CoverImagePropertiesSchema,
} from "~/utils/ribbons"

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

  let schema: z.ZodSchema<any>

  switch (ribbon.type) {
    case RibbonType.Banner: {
      schema = BannerPropertiesSchema
      break
    }
    case RibbonType.Countdown: {
      schema = CountdownPropertiesSchema
      break
    }
    case RibbonType.CoverImage: {
      schema = CoverImagePropertiesSchema
      break
    }
    default: {
      return json({ error: "Invalid ribbon type" }, { status: 400 })
    }
  }

  const validator = withZod(schema)
  const formData = await request.formData()
  const result = await validator.validate(formData)

  if (result.error) {
    return validationError(result.error)
  }

  const updatedRibbon = await db.ribbon.update({
    data: { properties: result.data },
    where: { id: ribbonId },
  })

  return json({ values: updatedRibbon.properties })
}
