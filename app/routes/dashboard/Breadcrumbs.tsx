import { ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid"
import { NavLink, useMatches } from "@remix-run/react"

export default function Breadcrumbs() {
  const matches = useMatches()
  const crumbs = matches
    // First get rid of any matches that don't have handle and crumb
    .filter((match) => Boolean(match.handle?.crumb))
    // Now map them into an array of elements, passing the route match to the
    // crumb function
    .map((match) => match.handle?.crumb(match))

  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol className="flex items-center space-x-4">
        <li>
          <div>
            <NavLink
              className="text-gray-400 hover:text-gray-500"
              to={matches[1]!.pathname}
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
