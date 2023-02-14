import type { User } from "@prisma/client"
import { UserRole } from "@prisma/client"
import { z } from "zod"

export const UserSchema: z.ZodSchema<
  Pick<User, "firstName" | "lastName" | "phone" | "role" | "email">
> = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  role: z.enum([UserRole.Admin, UserRole.User]),
})

export function getUserFullName(user: {
  firstName: string
  lastName: string
}): string {
  return `${user.firstName} ${user.lastName}`
}
