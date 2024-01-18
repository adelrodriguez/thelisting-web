import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { RibbonBase } from "./base"

export const TextProperties = z
  .object({
    body: z.string().min(1, "You must provide a body for the text"),
    decorationImage: z.string().optional(),
    hasUrl: z.preprocess(
      // Since this is coming from a checkbox, we both need to check for the
      // string "true" which is the value of the checkbox when checked, and the
      // boolean true value which would come from the database. We don't use
      // zod-form-data here since it only supports a literal value being
      // provided for the true value, and undefined.
      (val) => val === "true" || val,
      z.boolean().optional(),
    ),
    textAlignment: z.string().optional(),
    title: z.string().optional(),
    url: z.string().optional(),
    urlLabel: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.hasUrl) {
        return !!data.url
      }

      return true
    },
    {
      message: "You must provide a URL",
      path: ["url"],
    },
  )
  .refine(
    (data) => {
      if (data.hasUrl) {
        return !!data.urlLabel
      }

      return true
    },
    {
      message: "You must provide a URL label",
      path: ["urlLabel"],
    },
  )

export type TextProperties = z.infer<typeof TextProperties>

export const TextRibbon = RibbonBase.extend({
  properties: TextProperties,
  type: z.literal(RibbonType.Text),
})
