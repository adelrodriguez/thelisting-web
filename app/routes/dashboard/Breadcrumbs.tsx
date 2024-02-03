import { ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid"
import type { UIMatch } from "@remix-run/react"
import { NavLink, useMatches } from "@remix-run/react"

import type { RouteHandle } from "~/utils/remix"

type Match = UIMatch<unknown, RouteHandle | undefined>

function hasCrumb(match: Match): match is Match & {
  handle: { crumb: (match: Match) => { name: string; href: string } }
} {
  return Boolean(match.handle?.crumb)
}

export default function Breadcrumbs() {
  const matches = useMatches() as Match[]
  const crumbs = matches
    // First get rid of any matches that don't have handle and crumb
    .filter(hasCrumb)
    // Now map them into an array of elements, passing the route match to the
    // crumb function
    .map((match) => match.handle.crumb(match))

  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol className="flex items-center space-x-4">
        <li>
          <div>
            <NavLink
              className="text-gray-400 hover:text-gray-500"
              to={matches[1]?.pathname || ("." as const)}
            >
              <HomeIcon aria-hidden="true" className="h-5 w-5 flex-shrink-0" />
              <span className="sr-only">Home</span>
            </NavLink>
          </div>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.name}>
            <div className="flex items-center">
              <ChevronRightIcon
                aria-hidden="true"
                className="h-5 w-5 flex-shrink-0 text-gray-400"
              />
              <NavLink
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                to={crumb.href}
              >
                {crumb.name}
              </NavLink>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
