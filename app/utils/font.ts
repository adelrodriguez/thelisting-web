import { z } from "zod"

import { GOOGLE_FONTS_CSS_API_URL } from "~/config/consts"

export const GoogleWebFontsListSchema = z
  .object({
    items: z.array(
      z.object({
        family: z.string(),
      })
    ),
  })
  .transform((data) => data.items.map((item) => item.family))

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
