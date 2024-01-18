import { RibbonType as Type } from "@prisma/client"
import { z } from "zod"

export const RibbonName = z
  .string()
  .min(3, "You must provide a name for the ribbon")
  .max(50, "Ribbon name must be less than 50 characters")

export const RibbonPosition = z.coerce.number().int()

export const RibbonType = z.enum([
  Type.Banner,
  Type.Countdown,
  Type.CoverImage,
  Type.ImageCarousel,
  Type.ImageGallery,
  Type.Location,
  Type.Text,
])
export type RibbonType = z.infer<typeof RibbonType>

export const RibbonBase = z.object({
  name: RibbonName,
  position: RibbonPosition,
})
type RibbonBase = z.infer<typeof RibbonBase>
