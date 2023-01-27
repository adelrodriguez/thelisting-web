import { ListingType } from "@prisma/client"
import { startOfToday } from "date-fns"
import { z } from "zod"

import prisma from "~/helpers/prisma.server"

export const EventDateSchema = z
  .string()
  .transform((value) => new Date(value))
  .refine((value) => value >= startOfToday(), {
    message: "Event date must be in the future",
  })

export const PathSchema = z
  .string()
  .min(1)
  .trim()
  .transform((value) => value.toLowerCase())
  .transform((value) => value.replace(/[^a-z0-9]/g, "-"))
  .transform((value) => value.replace(/-+/g, "-"))
  .transform((value) => value.replace(/^-|-$/g, ""))

export const TitleSchema = z.string().min(1)

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

export async function verifyPathIsUnique(path: string) {
  const listing = await prisma.listing.findUnique({
    select: { id: true },
    where: { path },
  })

  return !listing
}
