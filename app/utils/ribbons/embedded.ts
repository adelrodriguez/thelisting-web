import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { RibbonBase } from "./base"

export const EmbeddedProperties = z.object({
  height: z.coerce.number().default(400),
  title: z.string().optional(),
  url: z.string(),
})

export type EmbeddedProperties = z.infer<typeof EmbeddedProperties>

export const EmbeddedRibbon = RibbonBase.extend({
  properties: EmbeddedProperties,
  type: z.literal(RibbonType.Embedded),
})

export type EmbeddedRibbon = z.infer<typeof EmbeddedRibbon>
