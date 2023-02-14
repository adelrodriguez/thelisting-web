import { z } from "zod"

export const BannerPropertiesSchema = z.object({
  backgroundImage: z.any().optional(),
  subtitle: z.string().optional(),
  title: z.string(),
})
export type BannerProperties = z.infer<typeof BannerPropertiesSchema>
