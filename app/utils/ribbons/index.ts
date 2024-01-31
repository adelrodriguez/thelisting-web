import { Ribbon, RibbonType } from "@prisma/client"
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

export const RibbonSchema = z.discriminatedUnion("type", [
  BannerRibbon,
  CountdownRibbon,
  CoverImageRibbon,
  ImageCarouselRibbon,
  ImageGalleryRibbon,
  LocationRibbon,
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
