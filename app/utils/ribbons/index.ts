import { type Ribbon, RibbonType } from "@prisma/client"
import { z } from "zod"

import { BannerRibbon } from "./banner"
import { CountdownRibbon } from "./countdown"
import { CoverImageRibbon } from "./cover-image"
import { EmbeddedRibbon } from "./embedded"
import { ImageCarouselRibbon } from "./image-carousel"
import { ImageGalleryRibbon } from "./image-gallery"
import { LocationRibbon } from "./location"
import { RegistryShowcaseRibbon } from "./registry-showcase"
import { TextRibbon } from "./text"

export * from "./banner"
export * from "./base"
export * from "./countdown"
export * from "./cover-image"
export * from "./embedded"
export * from "./image-carousel"
export * from "./image-gallery"
export * from "./location"
export * from "./registry-showcase"
export * from "./text"

export const RibbonSchema = z.discriminatedUnion("type", [
  BannerRibbon,
  CountdownRibbon,
  CoverImageRibbon,
  EmbeddedRibbon,
  ImageCarouselRibbon,
  ImageGalleryRibbon,
  LocationRibbon,
  RegistryShowcaseRibbon,
  TextRibbon,
])

export function getCoverImages(ribbons: Ribbon[]): {
  position: number
  url: string
}[] {
  return ribbons.reduce((acc: { url: string; position: number }[], ribbon) => {
    if (ribbon.type !== RibbonType.CoverImage) return acc

    const result = CoverImageRibbon.safeParse(ribbon)

    if (!result.success) return acc

    acc.push({
      position: ribbon.position,
      url: result.data.properties.image,
    })

    return acc
  }, [])
}

export function getRibbonFonts(ribbons: Ribbon[]) {
  const fonts: string[] = []

  ribbons.forEach((ribbon) => {
    if (ribbon.type === RibbonType.Banner) {
      const result = BannerRibbon.safeParse(ribbon)

      if (result.success && result.data.properties.titleFont) {
        fonts.push(result.data.properties.titleFont)
      }
    }
  })

  return fonts
}
