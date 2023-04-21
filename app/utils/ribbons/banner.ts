import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { RibbonBaseSchema } from "./base"

export const BannerPropertiesSchema = z.object({
  backgroundImage: z.string().optional(),
  decorationImage: z.string().optional(),
  imageFit: z.string().optional(),
  imagePosition: z.string().optional(),
  subtitle: z.string().optional(),
  title: z.string().min(1, "You must provide a title for the banner"),
})
export type BannerProperties = z.infer<typeof BannerPropertiesSchema>

export const BannerRibbonSchema = RibbonBaseSchema.extend({
  properties: BannerPropertiesSchema,
  type: z.literal(RibbonType.Banner),
})
