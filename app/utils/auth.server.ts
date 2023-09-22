import type { User } from "@prisma/client"
import { UserRole } from "@prisma/client"
import { redirect } from "@remix-run/node"

import auth from "~/helpers/auth.server"
import { forbidden } from "~/utils/remix"

export async function isUserAdmin(request: Request): Promise<User> {
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw redirect("/login")
  }

  if (user.role !== UserRole.Admin) {
    throw forbidden()
  }

  return user
}
