import { z } from "zod"

export const BannerPropertiesSchema = z.object({
  backgroundImage: z.string().url().optional(),
  subtitle: z.string().optional(),
  title: z.string(),
})
export type BannerProperties = z.infer<typeof BannerPropertiesSchema>
