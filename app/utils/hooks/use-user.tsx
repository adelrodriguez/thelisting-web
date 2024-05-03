import type { User } from "@prisma/client"
import { type ReactNode, createContext, useContext } from "react"

type LoggedInUser = Pick<User, "firstName" | "lastName" | "id" | "email" | "phone" | "role">

const UserContext = createContext<LoggedInUser | undefined>(undefined)

export function UserProvider({
  children,
  user,
}: {
  user: LoggedInUser
  children: ReactNode
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export default function useUser() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }

  return context
}
