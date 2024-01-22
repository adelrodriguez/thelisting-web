import { constructURL } from "google-fonts-helper"
import type { Redis } from "ioredis"
import { z } from "zod"

import { ONE_WEEK, REDIS_KEYS } from "~/config/consts"
import {
  GOOGLE_WEB_FONTS_DEVELOPER_API_KEY,
  GOOGLE_WEB_FONTS_URL,
} from "~/config/env.server"
import { generateKey } from "~/utils/redis"
import { Nullish } from "~/utils/type"

const FontSchema = z.object({
  family: z.string(),
  variants: z.array(z.string()),
})
type Font = z.infer<typeof FontSchema>

export function generateGoogleFontsUrl(fonts: Nullish<Font>[]): string {
  const families: { [key: string]: true | { wght: number[]; ital: number[] } } =
    {}

  // This is some ugly code, but it works. Blame the weird shape needed by
  // constructURL.
  for (const font of fonts) {
    if (!font) continue

    if (font.variants.length === 1) {
      families[font.family] = true
      continue
    }

    families[font.family] = { ital: [], wght: [] }

    for (const variant of font.variants) {
      const fontFamily = families[font.family]

      if (fontFamily === true || !fontFamily) {
        continue
      }

      if (variant === "regular") {
        fontFamily.wght.push(400)
        continue
      }

      if (variant === "italic") {
        fontFamily.ital.push(400)
        continue
      }

      const [weight, italic] = variant.split("i")

      if (italic && weight) {
        fontFamily.ital.push(parseInt(weight))

        continue
      } else if (weight) {
        fontFamily.wght.push(parseInt(weight))
      }
    }
  }

  const url = constructURL({ display: "swap", families })

  if (!url) {
    throw new Error("Could not construct Google Fonts URL")
  }

  return url
}

export async function getFontList(
  cache: Redis,
  url: string = GOOGLE_WEB_FONTS_URL,
  apiKey: string = GOOGLE_WEB_FONTS_DEVELOPER_API_KEY,
): Promise<Font[]> {
  const cachedFonts = await cache.get(REDIS_KEYS.GoogleFonts)

  if (cachedFonts) {
    return JSON.parse(cachedFonts) as Font[]
  }

  const res = await fetch(`${url}?key=${apiKey}`, {
    headers: {
      Referer: "https://www.giftthelisting.com/",
    },
  })

  const data = await res.json()

  const fonts = z
    .object({ items: z.array(FontSchema) })
    .transform((data) => data.items.map((item) => item))
    .parse(data)

  // Expire in 1 week
  await cache.set(
    REDIS_KEYS.GoogleFonts,
    JSON.stringify(fonts),
    "EX",
    ONE_WEEK.inSeconds,
  )

  const mset = fonts
    .map((font) => [
      REDIS_KEYS.GoogleFonts + ":" + font.family,
      JSON.stringify(font),
    ])
    .flat()

  await cache.mset(mset)

  return fonts
}

export async function getFont(cache: Redis, family: string): Promise<Font> {
  const cachedFont = await cache.get(
    generateKey(REDIS_KEYS.GoogleFonts, family),
  )

  if (cachedFont) {
    return FontSchema.parse(JSON.parse(cachedFont))
  }

  // Normally if this function is running, we should have cached the font,
  // specially since fonts were probably set without an expiration date. In case
  // the font is not cached, we should fetch all the fonts again and cache them.
  const fonts = await getFontList(cache)

  const font = fonts.find((font) => font.family === family)

  if (!font) {
    throw new Error(`Font ${family} not found`)
  }

  return font
}
