import { ListingStatus, ListingType } from "@prisma/client"
import { startOfToday } from "date-fns"
import { z } from "zod"

import db from "~/helpers/db.server"

export const ListingEventDateSchema = z.coerce
  .date()
  .min(startOfToday(), { message: "Event date must be in the future" })

export const EventDateSchema = ListingEventDateSchema // TODO(adelrodriguez): REMOVE THIS

export const ListingPathSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, {
    message: "Path can only contain letters, numbers and dashes",
  })

export const PathSchema = ListingPathSchema // TODO(adelrodriguez): REMOVE THIS

export const ListingTitleSchema = z.string().min(3, "Please enter a title")
export const TitleSchema = ListingTitleSchema // TODO(adelrodriguez): REMOVE THIS

export const ListingSubtitleSchema = z.string().optional()
export const SubtitleSchema = z.string().nullish()

export const CommerceIdSchema = z.string().nullish()

export const ListingTypeSchema = z.enum(
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
/**
 * @deprecated
 */
export const TypeSchema = ListingTypeSchema // TODO: REMOVE THIS

export const ListingOwnerSchema = z
  .string()
  .uuid({ message: "Please select a valid user" })

export const ListingStatusSchema = z.enum(
  [ListingStatus.Draft, ListingStatus.Published, ListingStatus.Closed],
  {
    errorMap: () => ({ message: "Please select a status" }),
  }
)

/**
 * @deprecated
 */
export const StatusSchema = ListingStatusSchema // TODO: REMOVE THIS

export const ListingCoverImageSchema = z
  .string()
  .min(1, "Please provide an image")
export const ListingThankYouImageSchema = z.string().optional()

export const ImageSchema = z.string().nullish().optional()

export async function verifyPathIsUnique(path: string) {
  const listing = await db.listing.findUnique({
    select: { id: true },
    where: { path },
  })

  return !listing
}
