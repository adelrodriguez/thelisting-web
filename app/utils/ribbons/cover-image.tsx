import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { RibbonBaseSchema } from "./base"

export const CoverImagePropertiesSchema = z.object({
  image: z.string().uuid("You must provide an image for the cover image"),
})

export type CoverImageProperties = z.infer<typeof CoverImagePropertiesSchema>
export function parseCoverImageProperties(
  data: unknown
): z.SafeParseReturnType<unknown, CoverImageProperties> {
  return CoverImagePropertiesSchema.safeParse(data)
}

export const CoverImageRibbonSchema = RibbonBaseSchema.extend({
  properties: CoverImagePropertiesSchema,
  type: z.literal(RibbonType.CoverImage),
})
