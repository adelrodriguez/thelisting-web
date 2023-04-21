import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { RibbonBaseSchema } from "./base"

export const ImageCarouselPropertiesSchema = z.object({
  duration: z.coerce
    .number()
    .int()
    .positive("Duration must be at least 1 second"),
  height: z.coerce.number().min(0).optional(),
  images: z
    .array(z.string())
    .min(1, "You must provide at least one image")
    .max(10, "You can only provide up to 10 images"),
})

export type ImageCarouselProperties = z.infer<
  typeof ImageCarouselPropertiesSchema
>

export const ImageCarouselRibbonSchema = RibbonBaseSchema.extend({
  properties: ImageCarouselPropertiesSchema,
  type: z.literal(RibbonType.ImageCarousel),
})
