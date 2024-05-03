import type { User } from "@prisma/client"

import { getFullName } from "~/utils/user"

export default function transformer(user: User): Pick<
  User,
  "id" | "firstName" | "lastName" | "email" | "phone" | "role"
> & {
  fullName: string
} {
  return {
    email: user.email,
    firstName: user.firstName,
    fullName: getFullName(user),
    id: user.id,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
  }
}
