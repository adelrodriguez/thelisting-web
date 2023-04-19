import { inspect } from "@xstate/inspect"

import { isDevelopment } from "~/config/vars"
import { isWindowDefined } from "~/utils/window"

// Setup XState Inspector
// See https://xstate.js.org/docs/packages/xstate-inspect/#usage
if (isWindowDefined() && isDevelopment) {
  inspect({
    iframe: false, // open in new window
    url: "https://stately.ai/viz?inspect", // (default)
  })
}

export { default as scraperMachine } from "./scraper"
