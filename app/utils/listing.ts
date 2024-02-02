import { ListingStatus, ListingType } from "@prisma/client"
import { z } from "zod"

export const ListingEventDateSchema = z.coerce.date()

export const ListingPathSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, {
    message: "Path can only contain letters, numbers and dashes",
  })

export const ListingTitleSchema = z.string().min(3, "Please enter a title")

export const ListingSubtitleSchema = z.string().optional()

export const ListingTypeSchema = z.enum(
  [
    ListingType.BabyShower,
    ListingType.Wedding,
    ListingType.Birthday,
    ListingType.Other,
  ],
  {
    errorMap: () => ({ message: "Please select a type of event" }),
  },
)

export const ListingOwnerSchema = z
  .string()
  .uuid({ message: "Please select a valid user" })

export const ListingStatusSchema = z.enum(
  [ListingStatus.Draft, ListingStatus.Published, ListingStatus.Closed],
  {
    errorMap: () => ({ message: "Please select a status" }),
  },
)

export const ListingCoverImageSchema = z.string().optional()
export const ListingThankYouImageSchema = z.string().optional()

export const ListingThemeSchema = z.object({
  colors: z
    .object({
      background: z.string().optional(),
      primary: z.string().optional(),
      secondary: z.string().optional(),
      text: z.string().optional(),
    })
    .optional(),
  darkLogo: z.coerce.boolean().optional(),
  fonts: z
    .object({
      body: z.string().optional(),
      heading: z.string().optional(),
    })
    .optional(),
})
