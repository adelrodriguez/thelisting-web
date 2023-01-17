import type { RouteMatch } from "@remix-run/react"
import { useMatches } from "@remix-run/react"

export default function useCurrentRouteMatch(): RouteMatch {
  const matches = useMatches()

  const currentRoute = matches[matches.length - 1]

  if (!currentRoute) throw new Error("No route match found")

  return currentRoute
}
