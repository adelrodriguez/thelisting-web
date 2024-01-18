import { z } from "zod"

import { BannerRibbon } from "./banner"
import { CountdownRibbon } from "./countdown"
import { CoverImageRibbon } from "./cover-image"
import { ImageCarouselRibbon } from "./image-carousel"
import { ImageGalleryRibbon } from "./image-gallery"
import { LocationRibbon } from "./location"
import { TextRibbon } from "./text"

export * from "./banner"
export * from "./base"
export * from "./countdown"
export * from "./cover-image"
export * from "./image-gallery"
export * from "./image-carousel"
export * from "./location"
export * from "./text"

export const Ribbon = z.discriminatedUnion("type", [
  BannerRibbon,
  CountdownRibbon,
  CoverImageRibbon,
  ImageCarouselRibbon,
  ImageGalleryRibbon,
  LocationRibbon,
  TextRibbon,
])

export type Ribbon = z.infer<typeof Ribbon>
