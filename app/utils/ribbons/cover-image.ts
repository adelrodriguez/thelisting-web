import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { RibbonBaseSchema } from "./base"

export const CoverImagePropertiesSchema = z.object({
  height: z.coerce
    .number()
    .min(0, "Height must be greater than 0")
    .int("Height must be an integer")
    .optional(),
  image: z.string().uuid("You must provide an image for the cover"),
})

export type CoverImageProperties = z.infer<typeof CoverImagePropertiesSchema>

export const CoverImageRibbonSchema = RibbonBaseSchema.extend({
  properties: CoverImagePropertiesSchema,
  type: z.literal(RibbonType.CoverImage),
})
