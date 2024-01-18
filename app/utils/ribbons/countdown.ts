import { RibbonType } from "@prisma/client"
import { isValid } from "date-fns"
import { z } from "zod"

import { RibbonBase } from "./base"

export const CountdownProperties = z.object({
  eventDatetime: z.string().refine((value) => {
    return isValid(new Date(value))
  }),
})

export type CountdownProperties = z.infer<typeof CountdownProperties>

export const CountdownRibbon = RibbonBase.extend({
  properties: CountdownProperties,
  type: z.literal(RibbonType.Countdown),
})
export type CountdownRibbon = z.infer<typeof CountdownRibbon>
