import { z } from "zod"

import { BannerRibbonSchema } from "./banner"
import { CountdownRibbonSchema } from "./countdown"
import { CoverImageRibbonSchema } from "./cover-image"
import { ImageCarouselRibbonSchema } from "./image-carousel"
import { ImageGalleryRibbonSchema } from "./image-gallery"

export * from "./banner"
export * from "./base"
export * from "./countdown"
export * from "./cover-image"
export * from "./image-gallery"
export * from "./image-carousel"

export const RibbonSchema = z.discriminatedUnion("type", [
  BannerRibbonSchema,
  CountdownRibbonSchema,
  CoverImageRibbonSchema,
  ImageCarouselRibbonSchema,
  ImageGalleryRibbonSchema,
])

export type Ribbon = z.infer<typeof RibbonSchema>
