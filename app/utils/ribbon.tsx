import { ClockIcon } from "@heroicons/react/20/solid"
import { ComputerDesktopIcon } from "@heroicons/react/24/solid"
import { RibbonType } from "@prisma/client"
import { z } from "zod"

export const BannerPropertiesSchema = z.object({
  backgroundImage: z.string().optional(),
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
