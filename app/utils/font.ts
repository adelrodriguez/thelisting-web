import { z } from "zod"

export const GoogleWebFontsListSchema = z
  .object({
    items: z.array(
      z.object({
        family: z.string(),
      })
    ),
  })
  .transform((data) => data.items.map((item) => item.family))
