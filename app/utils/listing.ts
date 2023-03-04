import type { Item } from "@prisma/client"
import { ListingStatus, ListingType } from "@prisma/client"
import { parse, startOfToday } from "date-fns"
import { z } from "zod"

import prisma from "~/helpers/prisma.server"

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
  const listing = await prisma.listing.findUnique({
    select: { id: true },
    where: { path },
  })

  return !listing
}

/**
 * This functions sorts the given list of items by stock. Items that are being
 * sold more are listed first. If an item is out of stock, it is listed last.
 */
export function sortByQuantity(itemA: Item, itemB: Item) {
  const itemASold = itemA.quantity - itemA.stock
  const itemBSold = itemB.quantity - itemB.stock

  if (itemA.stock === 0) return 1
  if (itemB.stock === 0) return -1

  return itemBSold - itemASold
}
