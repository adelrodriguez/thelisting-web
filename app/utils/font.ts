import { z } from "zod"

import { GOOGLE_FONTS_CSS_API_URL, ONE_WEEK, REDIS_KEYS } from "~/config/consts"
import {
  GOOGLE_WEB_FONTS_DEVELOPER_API_KEY,
  GOOGLE_WEB_FONTS_URL,
} from "~/config/env.server"
import cache from "~/helpers/cache.server"

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

export async function getGoogleWebFontsList() {
  const cachedFonts = await cache.get(REDIS_KEYS.GoogleFonts)

  if (cachedFonts) {
    return cachedFonts.split(",")
  }

  const res = await fetch(
    `${GOOGLE_WEB_FONTS_URL}?key=${GOOGLE_WEB_FONTS_DEVELOPER_API_KEY}`,
    {
      headers: {
        Referer: "https://www.giftthelisting.com/",
      },
    }
  )

  const data = await res.json()

  const fonts = z
    .object({
      items: z.array(
        z.object({
          family: z.string(),
        })
      ),
    })
    .transform((data) => data.items.map((item) => item.family))
    .parse(data)

  // Expire in 1 week
  await cache.set(
    REDIS_KEYS.GoogleFonts,
    fonts.join(","),
    "EX",
    ONE_WEEK.inSeconds
  )

  return fonts
}
