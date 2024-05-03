import type { CSSProperties, ReactNode } from "react"
import { createContext, useContext } from "react"
import type { z } from "zod"

import type { ListingThemeSchema } from "~/utils/listing"

type Theme = z.infer<typeof ListingThemeSchema>

const Context = createContext<Theme | undefined>(undefined)

Context.displayName = "Theme"

export function ThemeProvider({
  children,
  theme,
}: {
  children: ReactNode
  theme: Theme
}) {
  return <Context.Provider value={theme}>{children}</Context.Provider>
}

export default function useTheme(): { styles: CSSProperties; theme: Theme } {
  const theme = useContext(Context)

  if (theme === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  const styles: CSSProperties = {
    backgroundColor: theme.colors?.background,
    color: theme.colors?.text,
    fontFamily: theme.fonts?.body,
  }

  return { styles, theme }
}
