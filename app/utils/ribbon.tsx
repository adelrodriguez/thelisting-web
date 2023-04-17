import { ClockIcon } from "@heroicons/react/20/solid"
import { ComputerDesktopIcon } from "@heroicons/react/24/solid"
import { RibbonType } from "@prisma/client"
import { z } from "zod"

export const RibbonTypeSchema = z.enum([
  RibbonType.Banner,
  RibbonType.Countdown,
])

// === Banner ===
export const BannerTitleSchema = z
  .string()
  .min(1, "You must provide a title for the banner")
export const BannerSubtitleSchema = z.string().optional()

export const BannerPropertiesSchema = z.object({
  backgroundImage: z.string().optional(),
  subtitle: BannerSubtitleSchema,
  title: BannerTitleSchema,
})
export type BannerProperties = z.infer<typeof BannerPropertiesSchema>
export function parseBannerProperties(
  data: unknown
): z.SafeParseReturnType<unknown, BannerProperties> {
  return BannerPropertiesSchema.safeParse(data)
}

// === Countdown ===
export const CountdownEventDatetimeSchema = z.coerce
  .date()
  .min(new Date(), { message: "Event date and time must be in the future" })

export const CountdownPropertiesSchema = z.object({
  eventDatetime: CountdownEventDatetimeSchema,
})

export type CountdownProperties = z.infer<typeof CountdownPropertiesSchema>
export function parseCountdownProperties(
  data: unknown
): z.SafeParseReturnType<unknown, CountdownProperties> {
  return CountdownPropertiesSchema.safeParse(data)
}

export const RibbonNameSchema = z
  .string()
  .min(3, "You must provide a name for the ribbon")
  .max(50, "Ribbon name must be less than 50 characters")

export const RibbonPositionSchema = z.coerce.number()

const RibbonBaseSchema = z.object({
  name: z.string(),
  position: z.coerce.number().int().positive(),
})

export const BannerRibbonSchema = RibbonBaseSchema.extend({
  properties: BannerPropertiesSchema,
})

export const CountdownRibbonSchema = RibbonBaseSchema.extend({
  properties: CountdownPropertiesSchema,
})

// Ribbon Cards
export const RIBBON_CARD = {
  [RibbonType.Banner]: {
    bgColor: "bg-amber-500",
    icon: <ComputerDesktopIcon className="h-6 w-6" aria-hidden="true" />,
  },
  [RibbonType.Countdown]: {
    bgColor: "bg-sky-500",
    icon: <ClockIcon className="h-6 w-6" aria-hidden="true" />,
  },
}
