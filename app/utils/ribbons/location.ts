import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { RibbonBase } from "./base"

export const LocationProperties = z.object({
  address: z.string(),
  caption: z.string().optional(),
})

export type LocationProperties = z.infer<typeof LocationProperties>

export const LocationRibbon = RibbonBase.extend({
  properties: LocationProperties,
  type: z.literal(RibbonType.Location),
})
export type LocationRibbon = z.infer<typeof LocationRibbon>
