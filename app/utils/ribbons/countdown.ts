import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { RibbonBaseSchema } from "./base"

export const CountdownPropertiesSchema = z.object({
  eventDatetime: z.coerce
    .date()
    .min(new Date(), { message: "Event date and time must be in the future" }),
})

export type CountdownProperties = z.infer<typeof CountdownPropertiesSchema>

export const CountdownRibbonSchema = RibbonBaseSchema.extend({
  properties: CountdownPropertiesSchema,
  type: z.literal(RibbonType.Countdown),
})
