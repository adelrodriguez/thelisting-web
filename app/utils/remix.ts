import { SerializeFrom } from "@remix-run/node"

import type { LocaleFile } from "./i18n"

/**
 * Used to define the handle for a route.
 */
export type RouteHandle<Params = unknown, LoaderData = unknown> = {
  /**
   * Used to show the route in the dashboard's breadcrumbs.
   */
  crumb?: (args: { params: Params; data: SerializeFrom<LoaderData> }) => {
    href: string
    name: string
  }
  /**
   * A unique identifier for the route.
   */
  id: string
  /**
   * Used for internationalization.
   */
  i18n?: LocaleFile | LocaleFile[]
}
