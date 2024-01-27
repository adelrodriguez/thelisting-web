import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { HeightSchema, RibbonBase } from "./base"

export const LocationProperties = z.object({
  address: z.string(),
  caption: z.string().optional(),
  height: HeightSchema.default(300),
  zoom: z.coerce.number().optional().default(17),
})

export type LocationProperties = z.infer<typeof LocationProperties>

export const LocationRibbon = RibbonBase.extend({
  properties: LocationProperties,
  type: z.literal(RibbonType.Location),
})
export type LocationRibbon = z.infer<typeof LocationRibbon>
