import { RibbonType as Type } from "@prisma/client"
import { z } from "zod"

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
  name: z
    .string()
    .min(3, "You must provide a name for the ribbon")
    .max(50, "Ribbon name must be less than 50 characters"),
  position: z.coerce.number().int(),
  styles: z
    .object({
      backgroundColor: z
        .string()
        .optional()
        // TODO(adelrodriguez): temporary reset until we figure out a better way
        .transform((val) => (val === "#000000" ? undefined : val)),
      color: z
        .string()
        .optional()
        // Same as above
        .transform((val) => (val === "#000000" ? undefined : val)),
      height: z.coerce
        .number()
        .min(0, "Height must be equal to or greater than 0")
        .int("Height must be an integer")
        .optional()
        // If the value is 0, we want to remove the height property
        .transform((val) => (val === 0 ? undefined : val)),
    })
    .default({}),
})
export type RibbonBase = z.infer<typeof RibbonBase>
