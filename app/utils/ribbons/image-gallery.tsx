import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { RibbonBaseSchema } from "./base"

export const ImageGalleryPropertiesSchema = z.object({
  groupSize: z.coerce
    .number()
    .min(1, "You must provide a group size of at least 1"),
  images: z
    .array(z.string())
    .min(1, "You must provide at least one image")
    .max(10, "You can only provide up to 10 images"),
})

export type ImageGalleryProperties = z.infer<
  typeof ImageGalleryPropertiesSchema
>

export const ImageGalleryRibbonSchema = RibbonBaseSchema.extend({
  properties: ImageGalleryPropertiesSchema,
  type: z.literal(RibbonType.ImageGallery),
})
