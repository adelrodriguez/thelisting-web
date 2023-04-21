import { RibbonType } from "@prisma/client"
import { z } from "zod"

export const RibbonNameSchema = z
  .string()
  .min(3, "You must provide a name for the ribbon")
  .max(50, "Ribbon name must be less than 50 characters")

export const RibbonPositionSchema = z.coerce.number().int()

export const RibbonTypeSchema = z.enum([
  RibbonType.Banner,
  RibbonType.Countdown,
  RibbonType.CoverImage,
  RibbonType.ImageCarousel,
  RibbonType.ImageGallery,
  RibbonType.Text,
])

export const RibbonBaseSchema = z.object({
  name: RibbonNameSchema,
  position: RibbonPositionSchema,
})
