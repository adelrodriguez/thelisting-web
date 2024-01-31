import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { RibbonBase } from "./base"

export const BannerProperties = z.object({
  backgroundImage: z.string().optional(),
  decorationImage: z.string().optional(),
  imageFit: z.string().optional(),
  imagePosition: z.string().optional(),
  subtitle: z.string().optional(),
  title: z.string().optional(),
  titleFont: z.string().optional(),
})
export type BannerProperties = z.infer<typeof BannerProperties>

export const BannerRibbon = RibbonBase.extend({
  properties: BannerProperties,
  type: z.literal(RibbonType.Banner),
})
export type BannerRibbon = z.infer<typeof BannerRibbon>
