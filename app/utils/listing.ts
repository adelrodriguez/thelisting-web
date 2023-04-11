import type { Item } from "@prisma/client"
import { ListingStatus, ListingType } from "@prisma/client"
import { parse, startOfToday } from "date-fns"
import { z } from "zod"

import db from "~/helpers/db.server"

export const EventDateSchema = z
  .string()
  .transform((value) => parse(value, "yyyy-MM-dd", new Date()))
  .refine((value) => value >= startOfToday(), {
    message: "Event date must be in the future",
  })

export const PathSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, {
    message: "Path can only contain letters, numbers and dashes",
  })
  .trim()
  .transform((value) => value.toLowerCase())

export const TitleSchema = z.string().min(1)

export const SubtitleSchema = z.string().nullish()

export const CommerceIdSchema = z.string().nullish()

export const TypeSchema = z.enum(
  [
    ListingType.BabyShower,
    ListingType.Wedding,
    ListingType.Birthday,
    ListingType.Other,
  ],
  {
    errorMap: () => ({ message: "Please select a type of event" }),
  }
)

export const StatusSchema = z.enum(
  [ListingStatus.Draft, ListingStatus.Published, ListingStatus.Closed],
  {
    errorMap: () => ({ message: "Please select a status" }),
  }
)

export const ImageSchema = z.string().nullish().optional()

export async function verifyPathIsUnique(path: string) {
  const listing = await db.listing.findUnique({
    select: { id: true },
    where: { path },
  })

  return !listing
}
