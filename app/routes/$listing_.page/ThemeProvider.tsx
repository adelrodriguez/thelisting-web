import type { Listing } from "@prisma/client"
import type { CSSProperties, ReactNode } from "react"
import { useContext } from "react"
import { createContext } from "react"
import type { z } from "zod"

import { ListingThemeSchema } from "~/utils/listing"

type Theme = z.infer<typeof ListingThemeSchema>

const Context = createContext<Theme | undefined>(undefined)

Context.displayName = "Theme"

export function ThemeProvider({
  children,
  listing,
}: {
  children: ReactNode
  listing: Listing
}) {
  // TODO(adelrodriguez): Add error handling
  const theme = ListingThemeSchema.parse(listing.theme)

  return <Context.Provider value={theme}>{children}</Context.Provider>
}

export default function useTheme(): [CSSProperties, Theme] {
  const theme = useContext(Context)

  if (theme === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  const styles: CSSProperties = {
    backgroundColor: theme.colors?.background,
    color: theme.colors?.text,
  }

  return [styles, theme]
}
