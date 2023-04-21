import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { RibbonBaseSchema } from "./base"

export const TextPropertiesSchema = z.object({
  body: z.string().min(1, "You must provide a body for the text"),
  decorationImage: z.string().optional(),
  label: z.string().optional(),
  textAlignment: z.string().optional(),
  title: z.string().optional(),
  url: z.string().url().optional(),
})
export type TextProperties = z.infer<typeof TextPropertiesSchema>

export const TextRibbonSchema = RibbonBaseSchema.extend({
  properties: TextPropertiesSchema,
  type: z.literal(RibbonType.Text),
})
