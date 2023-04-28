import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { RibbonBaseSchema } from "./base"

export const LocationPropertiesSchema = z.object({
  address: z.string().optional(),
  caption: z.string().optional(),
  embedCode: z.string(),
  height: z.coerce.number().optional(),
})

export type LocationProperties = z.infer<typeof LocationPropertiesSchema>

export const LocationRibbonSchema = RibbonBaseSchema.extend({
  properties: LocationPropertiesSchema,
  type: z.literal(RibbonType.Location),
})
