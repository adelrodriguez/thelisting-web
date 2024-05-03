import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { HeightSchema, RibbonBase } from "./base"

export const ImageGalleryProperties = z.object({
  groupSize: z.coerce.number().min(1, "You must provide a group size of at least 1"),
  height: HeightSchema,
  images: z
    .array(z.string())
    .min(1, "You must provide at least one image")
    .max(10, "You can only provide up to 10 images"),
})

export type ImageGalleryProperties = z.infer<typeof ImageGalleryProperties>

export const ImageGalleryRibbon = RibbonBase.extend({
  properties: ImageGalleryProperties,
  type: z.literal(RibbonType.ImageGallery),
})
export type ImageGalleryRibbon = z.infer<typeof ImageGalleryRibbon>
