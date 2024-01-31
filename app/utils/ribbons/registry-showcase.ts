import { RibbonType } from "@prisma/client"
import { z } from "zod"

import { RibbonBase } from "./base"

export const RegistryShowcaseProperties = z.object({
  backgroundImage: z.string().optional(),
  decorationImage: z.string().optional(),
  imageFit: z.string().optional(),
  imagePosition: z.string().optional(),
  itemCount: z.coerce.number().optional(),
  subtitle: z.string().optional(),
  title: z.string().optional(),
})
export type RegistryShowcaseProperties = z.infer<
  typeof RegistryShowcaseProperties
>

export const RegistryShowcaseRibbon = RibbonBase.extend({
  properties: RegistryShowcaseProperties,
  type: z.literal(RibbonType.RegistryShowcase),
})

export type RegistryShowcaseRibbon = z.infer<typeof RegistryShowcaseRibbon>
