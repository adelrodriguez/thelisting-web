import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { RibbonBase } from "./base"

export const CoverImageProperties = z.object({
  image: z.string().url("You must provide an image for the cover"),
})

export type CoverImageProperties = z.infer<typeof CoverImageProperties>

export const CoverImageRibbon = RibbonBase.extend({
  properties: CoverImageProperties,
  type: z.literal(RibbonType.CoverImage),
})
type CoverImageRibbon = z.infer<typeof CoverImageRibbon>
