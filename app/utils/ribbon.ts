import { z } from "zod"

export const BannerPropertiesSchema = z.object({
  backgroundImage: z.any().optional(),
  subtitle: z.string().nullable(),
  title: z.string(),
})
export type BannerProperties = z.infer<typeof BannerPropertiesSchema>
