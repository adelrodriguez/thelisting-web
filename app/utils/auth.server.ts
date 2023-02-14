import { UserRole } from "@prisma/client"
import { unauthorized } from "remix-utils"

import auth from "~/helpers/auth.server"

export async function isUserAdmin(request: Request) {
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized("You must be logged in to access this page")
  }

  if (user.role !== UserRole.Admin) {
    throw unauthorized("You must be an admin to access this page")
  }

  return user
}
