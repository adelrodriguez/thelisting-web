import { z } from "zod"

export const BannerPropertiesSchema = z.object({
  backgroundImage: z.any().optional(),
  subtitle: z.string().nullish().optional(),
  title: z.string(),
})
export type BannerProperties = z.infer<typeof BannerPropertiesSchema>
export function parseBannerProperties(
  data: unknown
): z.SafeParseReturnType<unknown, BannerProperties> {
  return BannerPropertiesSchema.safeParse(data)
}

export const CountdownSchema = z.object({
  eventDatetime: z.coerce.date(),
})
export type CountdownProperties = z.infer<typeof CountdownSchema>
export function parseCountdownProperties(
  data: unknown
): z.SafeParseReturnType<unknown, CountdownProperties> {
  return CountdownSchema.safeParse(data)
}
