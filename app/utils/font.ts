import type { Redis } from "ioredis"
import { z } from "zod"

import { GOOGLE_FONTS_CSS_API_URL, ONE_WEEK, REDIS_KEYS } from "~/config/consts"

export function generateGoogleFontsUrl(fonts: (string | null | undefined)[]) {
  const values = fonts
    // Filter out null, undefined and empty strings
    .filter((font): font is string => typeof font === "string")
    .map((font) => font.replace(/ /g, "+"))
    .map((font) => `family=${font}`)
  const unique = new Set(values)
  const families = Array.from(unique)

  return `${GOOGLE_FONTS_CSS_API_URL}?${families.join("&")}`
}

export async function getGoogleWebFontsList(
  cache: Redis,
  url: string,
  apiKey: string,
): Promise<string[]> {
  const cachedFonts = await cache.get(REDIS_KEYS.GoogleFonts)

  if (cachedFonts) {
    return cachedFonts.split(",")
  }

  const res = await fetch(`${url}?key=${apiKey}`, {
    headers: {
      Referer: "https://www.giftthelisting.com/",
    },
  })

  const data = await res.json()

  const fonts = z
    .object({
      items: z.array(
        z.object({
          family: z.string(),
        }),
      ),
    })
    .transform((data) => data.items.map((item) => item.family))
    .parse(data)

  // Expire in 1 week
  await cache.set(
    REDIS_KEYS.GoogleFonts,
    fonts.join(","),
    "EX",
    ONE_WEEK.inSeconds,
  )

  return fonts
}
